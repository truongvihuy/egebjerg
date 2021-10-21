import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user_group', versionKey: false })
export class UserGroups extends Document {
    @Prop({ type: Number, required: true })
    _id: number;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Object, required: true })
    permission: Object;
}

export const UserGroupsSchema = SchemaFactory.createForClass(UserGroups);