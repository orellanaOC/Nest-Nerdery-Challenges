/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { Prisma } from '@prisma/client';
import {
	IPageInfoModel,
	IPaginatedType,
} from '../entities/pagination.interface';
import { PaginationInput } from '../dto/pagination-input.dto';

export class PaginationService {
    async paginate<T>(
        findMany: (args: Prisma.OrderFindManyArgs) => Promise<T[]>,
        paginationInput: PaginationInput,
        cursorField: keyof T,
        whereClause?: Prisma.OrderWhereInput,
        orderByClause?: Prisma.OrderOrderByWithRelationInput,
    ): Promise<IPaginatedType<T>> {
        const { first, after, last, before } = paginationInput;

        // Convert Cursors to Prisma Cursors
        const cursorAfter = after ? { id : Number(after) } : undefined;
        const cursorBefore = before ? { id : Number(before) } : undefined;

        // Determine the order direction based on whether `before` is being used
        const orderDirection = before ? 'desc' : 'asc';

        // Define the number of elements to take
        const take = first || last || 10;
        const skip = after || before ? 1 : 0;

        // Getting items using cursors and filters
        const edges = await findMany({
            where: whereClause,
            orderBy: orderByClause || { [cursorField]: orderDirection },
            take,
            skip,
            cursor: after ? cursorAfter : cursorBefore,
		});

		// Create cursors for the first and last elements
        const startCursor = edges.length > 0 ? String(edges[0][cursorField]) : null;
        const endCursor = edges.length > 0 ? String(edges[edges.length - 1][cursorField]) : null;

        // Check if there are more pages forward and back
        const hasNextPage = endCursor
            ? (await findMany({
                where: { 
                    ...whereClause, 
                    [cursorField]: { gt: edges[edges.length - 1][cursorField] } 
                },
                orderBy: { [cursorField]: 'asc' },
                take: 1,
            })).length > 0
            : false;

        const hasPreviousPage = startCursor
            ? (await findMany({
                where: { 
                    ...whereClause, 
                    [cursorField]: { lt: edges[0][cursorField] } 
                },
                orderBy: { [cursorField]: 'desc' },
                take: 1,
            })).length > 0
            : false;

        // Create page information
        const pageInfo: IPageInfoModel = {
            startCursor,
            endCursor,
            hasNextPage,
            hasPreviousPage,
        };

        return {
            edges: edges.map((edge) => ({
                cursor: String(edge[cursorField]),
                node: edge,
            })),
            pageInfo,
        };
    }
}