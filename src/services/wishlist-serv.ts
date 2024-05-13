import { Wishlist } from "../models/wish-list";
import { BaseService } from "./base-serv";



export class WishlistService extends BaseService {
	constructor() {
		super(Wishlist);
	}
}