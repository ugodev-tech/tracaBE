import {Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { Media} from '../models/users';
import { CategorySchema, MenuItemSchema, RestaurantSchema, updateCategorySchema, updateMenuItemSchema } from "../validator/shopOwner";
import { Category, MenuItem, Restaurant } from "../models/resturant";
import { writeErrorsToLogs } from "../support/helpers";

export class MyResturant {
    static async setupShop (req:Request, res:Response, next:NextFunction){
        try {
            const {id} = req.params;
            const { error, value } = RestaurantSchema.validate(req.body);
            if (error) {
                return failedResponse (res, 400, `${error.details[0].message}`)
            };

            // Check if idBack and idFront exist
            if (value.image) {
                const image = await Media.findById(value.image);
                if (!image) {
                return failedResponse(res, 404, 'ID Back media not found.');
                }
            };
            // check resturant
            const shop = await Restaurant.findOneAndUpdate({_id:id, owner:(req as any).user._id}, value, {new:true});
            if (!shop) {
                return failedResponse(res, 404, 'Restaurant not found.');
            }
        
            return successResponse(res,200,"Success", shop)
        } catch (error:any) {
            writeErrorsToLogs(error)
            return failedResponse(res,500, error.message)
        }
        
    };

    static async retrieveShop (req:Request, res:Response, next:NextFunction){
        try {
            const {id} = req.params;
            // check resturant
            const shop = await Restaurant.findOneAndUpdate({_id:id, owner:(req as any).user._id});
            if (!shop) {
                return failedResponse(res, 404, 'Restaurant not found.');
            }
            return successResponse(res,200,"Success", shop)
        } catch (error:any) {
            writeErrorsToLogs(error)
            return failedResponse(res,500, error.message)
        }
        
    };
};


export class CategoryController {
    static async createCategory(req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = CategorySchema.validate(req.body);
        if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
        }
  
        if (value.image) {
          const image = await Media.findById(value.image);
          if (!image) {
            return failedResponse(res, 404, 'Image media not found.');
          }
        };
        value.owner = (req as any).user._id;
        const restaurant = await Restaurant.findById(value.restaurant);
        if (!restaurant) {
            return failedResponse(res, 404, 'Restaurant not found.');
        }

        const newCategory = await Category.create(value);
        return successResponse(res, 201, 'Category created successfully', newCategory);
      } catch (error: any) {
        writeErrorsToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }
  
    static async retrieveCategory(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const category = await Category.findById(id).populate("image");
        if (!category) {
          return failedResponse(res, 404, 'Category not found.');
        }
        return successResponse(res, 200, 'Success', category);
      } catch (error: any) {
        writeErrorsToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }
  
    static async updateCategory(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const { error, value } = updateCategorySchema.validate(req.body);
        if (error) {
          return failedResponse(res, 400, `${error.details[0].message}`);
        }
  
        if (value.image) {
          const image = await Media.findById(value.image);
          if (!image) {
            return failedResponse(res, 404, 'Image media not found.');
          }
        }
        const owner = (req as any).user._id
        const updatedCategory = await Category.findOneAndUpdate({_id:id, owner:owner}, value, { new: true });
        if (!updatedCategory) {
          return failedResponse(res, 404, 'Category not found.');
        }
  
        return successResponse(res, 200, 'Category updated successfully', updatedCategory);
      } catch (error: any) {
        writeErrorsToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    };
  
    static async deleteCategory(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const owner = (req as any).user._id
        const deletedCategory = await Category.findOneAndDelete({_id:id, owner:owner});
        if (!deletedCategory) {
          return failedResponse(res, 404, 'Category not found.');
        }
  
        return successResponse(res, 200, 'Category deleted successfully', deletedCategory);
      } catch (error: any) {
        writeErrorsToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }
  
    static async listCategories(req: Request, res: Response, next: NextFunction) {
      try {
        const { page = 1, pageSize = 10, search, myShop } = req.query;
  
        const filter: any = {};
        if (search) {
          const regex = new RegExp(search.toString(), 'i'); // Case insensitive regex
          filter.$or = [{ name: regex }, { description: regex }];
        };
        if ((myShop as string)?.toLowerCase() === "true") {
            filter.owner = (req as any).user._id;
          }
  
        const categories = await Category.find(filter).populate("image")
          .skip((Number(page) - 1) * Number(pageSize))
          .limit(Number(pageSize));
  
        const totalCategories = await Category.countDocuments(filter);
        const totalPages = Math.ceil(totalCategories / Number(pageSize));
  
        return successResponse(res, 200, 'Success', {
          categories,
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            totalCategories,
            totalPages,
          },
        });
      } catch (error: any) {
        writeErrorsToLogs(error);
        return failedResponse(res, 500, error.message);
      }
    }
};

export class MenuItemController {
  static async createMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = MenuItemSchema.validate(req.body);
      if (error) {
        return failedResponse(res, 400, `${error.details[0].message}`);
      }

      value.owner = (req as any).user._id;

      if (value.coverImage) {
        const coverImage = await Media.findById(value.coverImage);
        if (!coverImage) {
          return failedResponse(res, 404, 'Cover image media not found.');
        }
      };
      const restaurant = await Restaurant.findById(value.restaurant);
        if (!restaurant) {
            return failedResponse(res, 404, 'Restaurant not found.');
      };

      const category = await Category.findById(value.category);
        if (!category) {
            return failedResponse(res, 404, 'category not found.');
      };

      if(value.images){
        for(const image of value.images){
            const imageExist = await Media.findById(image);
            if (!imageExist) {
              return failedResponse(res, 404, 'One of the images not found.');
            };
        }
      }

      const newMenuItem = await MenuItem.create(value);
      return successResponse(res, 201, 'Menu item created successfully', newMenuItem);
    } catch (error: any) {
      writeErrorsToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  static async retrieveMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const menuItem = await MenuItem.findById(id)
      .populate("coverImage images")
      .populate(
        {
          path:"restaurant",
          select:"name"

        }
      )
      if (!menuItem) {
        return failedResponse(res, 404, 'Menu item not found.');
      }
      return successResponse(res, 200, 'Success', menuItem);
    } catch (error: any) {
      writeErrorsToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  static async updateMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateMenuItemSchema.validate(req.body);
      if (error) {
        return failedResponse(res, 400, `${error.details[0].message}`);
      }

      const menuItem = await MenuItem.findOne({ _id: id, owner: (req as any).user._id });
      if (!menuItem) {
        return failedResponse(res, 404, 'Menu item not found or you are not the owner.');
      }

      if (value.coverImage) {
        const coverImage = await Media.findById(value.coverImage);
        if (!coverImage) {
          return failedResponse(res, 404, 'Cover image media not found.');
        }
      };

      if(value.images){
        for(const image of value.images){
            const imageExist = await Media.findById(image);
            if (!imageExist) {
              return failedResponse(res, 404, 'One of the images not found.');
            };
        }
      }

      const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, value, { new: true });
      return successResponse(res, 200, 'Menu item updated successfully', updatedMenuItem);
    } catch (error: any) {
      writeErrorsToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  static async deleteMenuItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const menuItem = await MenuItem.findOne({ _id: id, owner: (req as any).user._id });
      if (!menuItem) {
        return failedResponse(res, 404, 'Menu item not found or you are not the owner.');
      }

      const deletedMenuItem = await MenuItem.findByIdAndDelete(id);
      return successResponse(res, 200, 'Menu item deleted successfully', deletedMenuItem);
    } catch (error: any) {
      writeErrorsToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  static async listMenuItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 10, category, restaurant, myShop } = req.query;

      const filter: any = {};
      if (category) {
        filter.category = category;
      }
      if (restaurant) {
        filter.restaurant = restaurant;
      }
      if ((myShop as string)?.toLowerCase() === 'true') {
        filter.owner = (req as any).user._id;
      }

      const menuItems = await MenuItem.find(filter)
      .populate("coverImage images")
      .populate(
        {
          path:"restaurant",
          select:"name"

        }
      )
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize));

      const totalMenuItems = await MenuItem.countDocuments(filter);
      const totalPages = Math.ceil(totalMenuItems / Number(pageSize));

      return successResponse(res, 200, 'Success', {
        menuItems,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          totalMenuItems,
          totalPages,
        },
      });
    } catch (error: any) {
      writeErrorsToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }
}
