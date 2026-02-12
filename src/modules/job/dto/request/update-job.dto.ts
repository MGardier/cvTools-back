import { PartialType } from "@nestjs/mapped-types";
import { CreateJobRequestDto } from "./create-job.dto";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class UpdateJobRequestDto extends PartialType(CreateJobRequestDto){
 
  @IsOptional()
  @IsString({
    message: 'La raison du refus doit être une chaîne de caractères.',
  })
  rejectedReason?: string | null;


  
    @IsNotEmpty({ message: 'La date  ne peut pas être vide.' })
    @IsDateString({}, { message: 'La date doit être une date valide.' })
    appliedAt: string;
}
