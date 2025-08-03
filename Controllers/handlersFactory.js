const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const qs = require("qs"); // مكتبة بتحول الكويري لكائن js يفهمه
const Reviews = require("../Models/reviewModel");
const sequelize = require("sequelize");
const Product = require("../Models/productModel");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findOne({ where: { id: id } });

    if (!document) {
      return next(new ApiError(`No document found for this id: ${id}`, 404));
    }
    await document.destroy();
    res.status(200).json({ message: "document deleted succesfully" });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByPk(id);
    if (!document) {
      return next(new ApiError(`No document found for this id: ${id}`, 404));
    }

    await document.update(req.body);
    // // Trigger Saving
    // document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, includeOptions = null) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const options = {
      where: { id },
    };
    // Add include if provided
    if (includeOptions) {
      options.include = includeOptions;
    }
    const document = await Model.findOne(options);
    if (!document) {
      return next(new ApiError(`no document found for this id: ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, includeOptions = null) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    const documentCounts = await Model.count({ where: filter });
    const parsedQuery = qs.parse(req._parsedUrl.query);
    const apiFeatures = await new ApiFeatures(Model, parsedQuery)
      .filter()
      .sort()
      .limitFields()
      .search(Model.name)
      .paginate(documentCounts);

    apiFeatures.options.where = { ...apiFeatures.options.where, ...filter };
    if (includeOptions) {
      apiFeatures.options.include = includeOptions;
    }

    const documents = await Model.findAll(apiFeatures.options);
    res.status(200).json({
      results: documents.length,
      pagination: apiFeatures.pagination,
      data: documents,
    });
  });

// Calculate Average Rating & Quantity to a product
Reviews.calculateAverageRatingsAndQuantity = async function (productId) {
  const result = await Reviews.findAll({
    where: { productId },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("ratings")), "avgRatings"],
      [sequelize.fn("COUNT", sequelize.col("ratings")), "noRating"],
    ],
    raw: true,
  });

  if (result.length > 0 && result[0].noRating > 0) {
    await Product.update(
      {
        ratingAverage: result[0].avgRatings,
        ratingQuantity: result[0].noRating,
      },
      { where: { id: productId } }
    );
  } else {
    await Product.update(
      { where: { id: productId } },
      { ratingsAverage: 0, ratingsQuantity: 0 }
    );
  }
  // console.log(result);
};
Reviews.addHook("afterCreate", async (review) => {
  await Reviews.calculateAverageRatingsAndQuantity(review.productId);
});
Reviews.addHook("afterDestroy", async (review, options) => {
  await Reviews.calculateAverageRatingsAndQuantity(review.productId);
});
Reviews.addHook("afterUpdate", async (review, options) => {
  await Reviews.calculateAverageRatingsAndQuantity(review.productId);
});
