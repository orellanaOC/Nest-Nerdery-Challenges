/* eslint-disable prettier/prettier */
/* eslint-disable indent */

import { Field, InputType, Int } from "@nestjs/graphql";
import { OrderStatus } from "@prisma/client";
import { PaginationInput } from "src/pagination/dto/pagination-input.dto";

@InputType()
export class OrderFilter {
    @Field(() => OrderStatus, { nullable: true })
    status?: OrderStatus;

    @Field(() => PaginationInput, { nullable: true })
    pagination?: PaginationInput;

    @Field(() => Int, { nullable: true })
    userId?: number;
}