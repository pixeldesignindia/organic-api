import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { ProductService } from '../services/product-serv';

export default class ProductController extends BaseController {
	constructor() {
		super(new ProductService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/recent', (req, res) => {
			this.getRecentProducts(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/add-images', (req, res) => {
			this.addImages(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/remove-image', (req, res) => {
			this.removeImage(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/set-default-image', (req, res) => {
			this.setDefaultImage(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.PRODUCT + '/detail/:id', (req, res) => {
			this.find(req, res, this);
		});

		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/has-liked', (req, res) => {
			this.hasLiked(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/has-bookmarked', (req, res) => {
			this.hasBookmarked(req, res, this);
		});

		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/add-like', (req, res) => {
			this.addLike(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/remove-like', (req, res) => {
			this.removeLike(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.PRODUCT + '/likes/:id/:pageNumber/:pageSize', (req, res) => {
			this.getLikes(req, res, this);
		});

		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/add-comment', (req, res) => {
			this.addComment(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/update-comment', (req, res) => {
			this.updateComment(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/remove-comment', (req, res) => {
			this.removeComment(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.PRODUCT + '/comments/:id/:pageNumber/:pageSize', (req, res) => {
			this.getComments(req, res, this);
		});

		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/add-bookmark', (req, res) => {
			this.addBookmark(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/remove-bookmark', (req, res) => {
			this.removeBookmark(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.PRODUCT + '/bookmarks/:id/:pageNumber/:pageSize', (req, res) => {
			this.getBookmarks(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/remove-tag', (req, res) => {
			this.removeTag(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/add-rating', (req, res) => {
			this.addRating(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/update-rating', (req, res) => {
			this.updateRating(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/has-rating', (req, res) => {
			this.hasRating(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.PRODUCT + '/ratings/:id/:pageNumber/:pageSize', (req, res) => {
			this.getRatings(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/notVerified', (req, res) => {
			this.getUnVerifiedProducts(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/add-video', (req, res) => {
			this.addVideo(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/remove-video', (req, res) => {
			this.removeVideo(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PRODUCT + '/latest-video', (req, res) => {
			this.getLatestVideoProduct(req, res, this);
		});
	}

	private getRecentProducts(req: Request, res: Response, that: any) {
		that.service.getRecentProducts(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting recent products', location: 'product-ctrl => getRecentProducts', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'getRecentProducts' }, 200);
			}
		);
	}
	private getUnVerifiedProducts(req: Request, res: Response, that: any) {
		that.service.getUnVerifiedProducts(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting recent products', location: 'product-ctrl => getRecentProducts', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'getRecentProducts' }, 200);
			}
		);
	}

	private find(req: Request, res: Response, that: any) {
		that.service.find(req.params.id, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding product detail', location: 'product-ctrl => find', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'find' }, 200);
			}
		);
	}

	private getLikes(req: Request, res: Response, that: any) {
		that.service.getLikes(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting product likes', location: 'product-ctrl => getLikes', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'getLikes' }, 200);
			}
		);
	}

	private getComments(req: Request, res: Response, that: any) {
		that.service.getComments(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting product comments', location: 'product-ctrl => getComments', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'getComments' }, 200);
			}
		);
	}

	private getBookmarks(req: Request, res: Response, that: any) {
		that.service.getBookmarks(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting product bookmarks', location: 'product-ctrl => getBookmarks', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'getBookmarks' }, 200);
			}
		);
	}

	private setDefaultImage(req: Request, res: Response, that: any) {
		that.service.setDefaultImage(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in setting default image', location: 'product-ctrl => setDefaultImage', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'setDefaultImage' }, 200);
			}
		);
	}

	private hasLiked(req: Request, res: Response, that: any) {
		that.service.hasLiked(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in checking has liked', location: 'product-ctrl => hasLiked', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'hasLiked' }, 200);
			}
		);
	}

	private hasBookmarked(req: Request, res: Response, that: any) {
		that.service.hasBookmarked(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in checking has bookmarked', location: 'product-ctrl => hasBookmarked', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'hasBookmarked' }, 200);
			}
		);
	}

	private removeImage(req: Request, res: Response, that: any) {
		that.service.removeImage(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing image', location: 'product-ctrl => removeImage', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'removeImage' }, 200);
			}
		);
	}

	private addImages(req: Request, res: Response, that: any) {
		that.service.addImages(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding image', location: 'product-ctrl => addImages', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'addImages' }, 200);
			}
		);
	}

	private addLike(req: Request, res: Response, that: any) {
		that.service.addLike(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding like', location: 'product-ctrl => addLike', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'addLike' }, 200);
			}
		);
	}

	private removeLike(req: Request, res: Response, that: any) {
		that.service.removeLike(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing like', location: 'product-ctrl => removeLike', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'removeLike' }, 200);
			}
		);
	}

	private addComment(req: Request, res: Response, that: any) {
		that.service.addComment(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding comment', location: 'product-ctrl => addComment', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'addComment' }, 200);
			}
		);
	}

	private updateComment(req: Request, res: Response, that: any) {
		that.service.updateComment(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in updating comment', location: 'product-ctrl => updateComment', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'updateComment' }, 200);
			}
		);
	}

	private removeComment(req: Request, res: Response, that: any) {
		that.service.removeComment(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing comment', location: 'product-ctrl => removeComment', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'removeComment' }, 200);
			}
		);
	}

	private addBookmark(req: Request, res: Response, that: any) {
		that.service.addBookmark(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding bookmark', location: 'product-ctrl => addBookmark', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'addBookmark' }, 200);
			}
		);
	}

	private removeBookmark(req: Request, res: Response, that: any) {
		that.service.removeBookmark(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing bookmark', location: 'product-ctrl => removeBookmark', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'removeBookmark' }, 200);
			}
		);
	}
	private removeTag(req: Request, res: Response, that: any) {
		that.service.removeTagFromProduct(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing bookmark', location: 'product-ctrl => removeBookmark', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'removeBookmark' }, 200);
			}
		);
	}
	private addRating(req: Request, res: Response, that: any) {
		that.service.addRating(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding comment', location: 'product-ctrl => addComment', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'addComment' }, 200);
			}
		);
	}
	private updateRating(req: Request, res: Response, that: any) {
		that.service.updateRating(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in updating comment', location: 'product-ctrl => updateComment', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'updateComment' }, 200);
			}
		);
	}
	private hasRating(req: Request, res: Response, that: any) {
		that.service.hasRating(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in checking has liked', location: 'product-ctrl => hasLiked', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'hasLiked' }, 200);
			}
		);
	}
	private getRatings(req: Request, res: Response, that: any) {
		that.service.getRatings(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting product likes', location: 'product-ctrl => getLikes', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'getLikes' }, 200);
			}
		);
	}
	private removeVideo(req: Request, res: Response, that: any) {
		that.service.removeVideo(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in remove video', location: 'product-ctrl => removeVideo', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'removeVideo' }, 200);
			}
		);
	}
	private addVideo(req: Request, res: Response, that: any) {
		that.service.addVideo(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding video', location: 'product-ctrl => addVideo', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'addVideo' }, 200);
			}
		);
	}
	private getLatestVideoProduct(req: Request, res: Response, that: any) {
		that.service.getLatestProductsWithVideo(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting  videos in product', location: 'product-ctrl => getLatestVideoProduct', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'product-ctrl', methodName: 'getLatestVideoProduct' }, 200);
			}
		);
	}
}
  
