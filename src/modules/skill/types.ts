export type TCreateSkill = {
  label: string;
  createdBy: number;
}

export type TUpdateSkill =  Pick<TCreateSkill, 'label'>