const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const Category = require("../Models/categoryModel"); //استيراد المودل, النموذج
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../Middlewares/uploadImageMiddleware");

// ----'upload Image Middleware'----
exports.uploadCategoryImage = uploadSingleImage("image");

// Image Processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // <-- مهم جداً

  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);

    // save image into our DB
    req.body.image = filename;
  }

  next();
});

// asyncHandler بتعمل كاتش للسيشن وبترميه للايرور هاندلر الخاص بالإكسبريس
// بدل التراي والكاتش

// @desc Get all categories OR list of categories
// @route GET /api/v1/categories
// @route GET /api/v1/categories?page=2&limit=5
// @access Public
exports.getCategories = factory.getAll(Category);
// asyncHandler(async (req, res) => {
//   const documentCounts = await Category.count();
//   const apiFeatures = await new ApiFeatures(Category, req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .search()
//     .paginate(documentCounts);

//   const categories = await Category.findAll({
//     where: apiFeatures.options.where,
//     ...apiFeatures,
//   });

//   res.status(200).json({
//     results: categories.length,
//     pagination: apiFeatures.pagination,
//     data: categories,
//   });
// });

// @desc Get specific category by id
// @route GET api/v1/categories/:id
// @access Public
exports.getCategory = factory.getOne(Category);
// asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const category = await Category.findOne({ where: { id: id } });
//   // const category = await Category.findByPk(id);
//   if (!category) {
//     // res.status(404).json({msg: `no category found for this id ${id}`});
//     return next(new ApiError(`no category found for this id: ${id}`, 404));
//     // // throw new Error('category not found!');
//   }
//   res.status(200).json({ data: category });
// });

// @desc  Create category
// @route POST /api/v1/categories
// @access Private/Admin-Manager
exports.createCategory = factory.createOne(Category);
// asyncHandler(async (req, res) => {
//   const { name } = req.body;
//   // try{
//   const newCategory = await Category.create({
//     name,
//     slug: slugify(name),
//   });
//   res.status(201).json({ data: newCategory });

//   // });
//   // }
//   // catch (err){
//   // res.status(400).json({error: err.message})
//   // }
// });

// @desc Update specific category
// @route PUT /api/v1/categories/:id
// @access Private/Admin-Manager
exports.updateCategory = factory.updateOne(Category);
// asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { categoryName } = req.body;

//   const category = await Category.findOne({ where: { id: id } });
//   if (!category) {
//     // return res.status(404).json({error: "No category has this id"});
//     return next(new ApiError(`no category found for this id: ${id}`, 404));
//   }
//   category.categoryName = categoryName;
//   category.slug = slugify(categoryName);

//   await category.save();
//   res.status(200).json({ data: category });
// });

// @desc Delete category
// @route DELETE /api/v1/categories/:id
// @access Private/Admin
exports.deleteCategory = factory.deleteOne(Category);
// asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const category = await Category.findOne({ where: { id: id } });

//   if (!category) {
//     // return res.status(404).json({error: "Category not found!"});
//     return next(new ApiError(`no category found for this id: ${id}`, 404));
//   }
//   await category.destroy();
//   res.status(200).json({ message: "Category deleted succesfully" });
// });
