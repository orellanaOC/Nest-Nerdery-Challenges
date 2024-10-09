/* eslint-disable prettier/prettier */
/* eslint-disable indent */

export interface IPaginatedType<T> {
	edges: Edge<T>[];
	pageInfo: IPageInfoModel;
}

export interface IPageInfoModel {
	endCursor?: string;
	startCursor?: string;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface Edge<T> {
	cursor: string;
	node: T;
}
