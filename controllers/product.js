const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash"); // _ this is a private stuff that if we have a variable but dont want to use it too much explicitly
const fs = require("fs"); //whenever user shows this is my file and here it is located we need to access that path so we need install filesystem as well it comes as default so do not need to npm install it

/*The only reason we want to use form data is that we have some multipart or binary files (if we
  like that user should some pdf doc or jpeg image or mp3)for this we prefer form data. I can use 
  form data for name,email,password as well but json response makes more sense to process these things
  further.So since in product we will be fetching up the tshirts photo as well that is why we are processing 
  form data.
  Why Lodash?
  =>Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.
  =>Lodash’s modular methods are great for:

     Iterating arrays, objects, & strings
     Manipulating & testing values
     Creating composite functions
*/

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found"
        });
      }
      req.product = product;
      next();
    });
};
//as soon as form object creates it expects 3 things err and fields like name,email and files like pdf,image
//form.keepExtension : to say wether the files are in png or jpeg format
//
exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }
    //destructure the fields
    const { name, description, price, category, stock, qrcode, color, size, code } = fields;

    if (!name || !description || !price || !category || !stock || !qrcode || !color || !size || !code) {
      return res.status(400).json({
        error: "Please include all fields"
      });
    }

    let product = new Product(fields);
  
    //handle file here & 3 mb = 3000000 apprx 1024 * 1024 * 2
    if (file.photo) {
     // if (file.photo.size > 3000000) {
     //   return res.status(400).json({
     //     error: "File size too big!"
     //   });
     // } 
      //if photo is less than 3 mb then we include the file in product and in model we have data product.photo's data as buffer and contentType as 
      //String. And then (product.photo.data = fs.readFileSync(file.photo.path);) this is where we mention the entire full path of the file
      //in readFileSync we pass formidable's objects given file.photo.path to grab us the exact path of the file 
      //we define contentType for DB for the type of file (pdf,image etc)
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product);

    //save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Saving tshirt in DB failed"
        });
      }
      res.json(product);
    });
  });
};

//we have undefined the only bulking thing that is the photo. and where does req.product comes we know req.params which extracts the productId we pass in url using 
//getProducctId controller.
exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware
//return the photo separately and checking first if it is there.Then set the contentType and response the phto
//This middleware can be used to return the required products photo if someone calls it 
// from router.get("/product/photo/:productId", photo) like this.
//all these is part of performance optimization
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

// delete controllers
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product"
      });
    }
    res.json({
      message: "Deletion was a success",
      deletedProduct
    });
  });
};

// delete controllers
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    //updation code //loaddash's extend method takes existing values in object that i'm having (here the existing product) and
    //extends it means all the updation values get involve there.And can also update values Image at 10:32 in 08 video of Adding T shirt to our backend
    //extend requires to things first what are the fields I should be looking up for here it is product and then we can directly take it from the fields.
    //This fields now are gonna be updated inside this product because of lodash. This two line code is reponsible for updation  
    let product = req.product;
    product = _.extend(product, fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!"
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product);

    //save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Updation of product failed"
        });
      }
      res.json(product);
    });
  });
};

/*product listing
 .select(-photo) :dont select the photo, .limit(limit): limit variable passed in limit method to show no. of products as 8 only
req.query : whenever there is a ? there is a query fired. Passing a limit object using query. So if there is query from front end
and has a property for .limit use ?____: this one else ? : ____ this one
Whenever u take any parameter from user major languages handle it as a string java,js becuase this is the way these languages are architectured.
so we wrap this query parameter and convert it to no. using parseInt(req.query.limit) , .sort : we can sort it on creation date,how many sold etc.
here we have sorted on ascending order. examples: Product.find().sort([['updatedAt','descending']]) or .sort([[sortBy, "asc"]]).Now same as limit we 
provide a default value if there is no query for that let sortBy = req.query.sortBy ? req.query.sortBy : "_id"; if not given sort on base of id's 
So thats your getAllProducts which is configurable from frontend so like in some section i want products to be sort based on creation date in some
other section I want it to be sort based on no. of products sold and if not defined then It will automatically sorted on id's. 
*/
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "NO product FOUND"
        });
      }
      res.json(products);
    });
    /*
    for simply getting all products 
    Product.find()
    .exec((err,products)=>{
      if(err){
        return res.status(400).json({
          error: "No product found"
        });
      }
      res.json(products);
    });
    */ 
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "NO category found"
      });
    }
    res.json(category);
  });
};

/*bulkWrite can be performed when we want to update,delete etc 2 or more values together and is a method of mongoose
we want to update each and every product in our orders with the no. of count bought.So if 3 tshirts are bought then 
stock - 3 and sold + 3. Using map we are iterating each and every product in order and using updateOne updating these two
values together that is we are performing two oprs everytime. filter is to find the id of the current product or prod,update to update them and in mongodb we use 
$inc to update any field.
bulkWrite contains 3 parameters that can be seen at mongoose.com/bulkWrite. 1st is operations 2nd is options and 3rd the usual 
callback of err and the object.
*/
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map(prod => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } }
      }
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed"
      });
    }
    next();
  });
};
