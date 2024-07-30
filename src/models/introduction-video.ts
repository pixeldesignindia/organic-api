import mongoose, { Schema } from 'mongoose';

interface IVideo extends IBase {
	video_file: string;
	created_at: Date;
};

const IntroSchema = new Schema({
	video_file: { type:String, required: true },

	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
});

const Intro = mongoose.model<IVideo>('IntroVideos', IntroSchema);

export { Intro, IntroSchema, IVideo };
