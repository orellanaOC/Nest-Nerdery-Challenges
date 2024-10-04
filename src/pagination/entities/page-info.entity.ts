/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PageInfoModel {
     // Cursor of the last/first element of the current page
    @Field(() => String, { nullable: true })
    endCursor?: string;
    
    @Field(() => String, { nullable: true })
    startCursor?: string;
    
    // Indicates if there are more elements after/before the current page 
    @Field(() => Boolean)
    hasNextPage: boolean;
    
    @Field(() => Boolean)
    hasPreviousPage: boolean;
}