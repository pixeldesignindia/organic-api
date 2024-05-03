import { OrderService } from "../services/order-serv";
import BaseController from "./base-ctrl";






export class OrderController extends BaseController {
	constructor() {
		super(new OrderService());

		this.initializeRoutes();
	}

	public initializeRoutes(){

    }
}