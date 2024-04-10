import mongoose, { Schema } from "mongoose";

interface IAttachment extends IBase {
    file_name: string,
    file_type: string,
    file_extension: string,
    saved_file_name: string,
};

const AttachmentSchema = new Schema(
    {
        name: { type: String, required: true },
        file_type: { type: String, required: true },
        file_name: { type: String, required: true },
        description: { type: String },
        file_extension: { type: String, required: true },
        saved_file_name: { type: String, required: true },

        created_at: { type: Date },
        updated_at: { type: Date },
        is_active: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true },
    }
);

const Attachment = mongoose.model<IAttachment>('Attachment', AttachmentSchema);

export { Attachment, IAttachment, AttachmentSchema }