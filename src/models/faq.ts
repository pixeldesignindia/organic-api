import mongoose, { Schema } from 'mongoose';


interface IFaq extends IBase {
	answer: string;
	question: string;

}

const FAQSchema = new Schema({
	answer: { type: String, required: true },
	question: { type: String, required: true },

	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
});

const FAQ = mongoose.model<IFaq>('FAQs', FAQSchema);

export { FAQ,IFaq,FAQSchema };
