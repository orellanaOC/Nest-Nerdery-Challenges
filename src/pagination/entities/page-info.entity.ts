/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PageInfoModel {
    @Field(() => String, { nullable: true })
    endCursor?: string; // Cursor of the last element 
    
    @Field(() => String, { nullable: true })
    startCursor?: string; // Cursor of the first element 
    
    @Field(() => Boolean)
    hasNextPage: boolean; // Indicates if there are more elements after the current page 
    
    @Field(() => Boolean)
    hasPreviousPage: boolean; // Indicates if there are more elements before the current page
}