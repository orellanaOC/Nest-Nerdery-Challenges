/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import {
	IPageInfoModel,
	IPaginatedType,
} from '../entities/pagination.interface';
import { PaginationInput } from '../dto/pagination-input.dto';

export class PaginationService {
	async paginate<
		T,
		FindManyArgs extends { where?: any; orderBy?: any; include?: any },
	>(
		findMany: (args: FindManyArgs) => Promise<T[]>,
		paginationInput: PaginationInput,
		cursorField: keyof T,
		whereClause?: FindManyArgs['where'],
		orderByClause?: FindManyArgs['orderBy'],
		includeClause?: FindManyArgs['include'],
	): Promise<IPaginatedType<T>> {
		const { first, after, last, before } = paginationInput;

		let cursor = after ? { [cursorField]: parseInt(after, 10) } : undefined;

		// If paginating backwards with 'before', set the cursor accordingly
		if (before) {
			cursor = { [cursorField]: parseInt(before, 10) };
		}

		// Define the direction of ordering and the number of elements to take
		let take = first || last || 10;
		if (last) {
			take = -take; // A negative take value will paginate backwards
		}

		// Skip one item to avoid including the item at the cursor itself
		const skip = cursor ? 1 : 0;

		// Fetch items using the cursor and filters
		const edges = await findMany({
			where: whereClause,
			orderBy: orderByClause || { [cursorField]: 'asc' },
			take,
			skip,
			cursor,
			include: includeClause,
		} as unknown as FindManyArgs);

		// Create cursors for the first and last elements
		const startCursor =
			edges.length > 0 ? String(edges[0][cursorField]) : null;
		const endCursor =
			edges.length > 0
				? String(edges[edges.length - 1][cursorField])
				: null;

		// Determine if there are more pages in both directions
		const hasNextPage = endCursor
			? !!(
					await findMany({
						where: whereClause
							? { ...(whereClause as object) }
							: {
									[cursorField]: {
										gt: edges[edges.length - 1][
											cursorField
										],
									},
								},
						cursor: { [cursorField]: parseInt(endCursor, 10) },
						skip: 1,
						take: 1,
						orderBy: { [cursorField]: 'asc' },
						include: includeClause,
					} as unknown as FindManyArgs)
				).length
			: false;

		const hasPreviousPage = startCursor
			? !!(
					await findMany({
						where: whereClause
							? { ...(whereClause as object) }
							: { [cursorField]: { lt: edges[0][cursorField] } },
						cursor: { [cursorField]: parseInt(startCursor, 10) },
						skip: 1,
						take: 1,
						orderBy: { [cursorField]: 'desc' }, // Searching backwards
						include: includeClause,
					} as unknown as FindManyArgs)
				).length
			: false;

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
