const { Op, where, fn, col } = require("sequelize");

class ApiFeatures {
  constructor(model, queryString) {
    this.model = model; // لحساب عدد السجلات الكلي عند الحاجة
    this.queryString = queryString;
    this.filters = {};
    this.options = {};
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let where = {};

    if (queryObj.category) {
      where.categoryId = queryObj.category;
    }
    if (queryObj.subCategory) {
      where.subCategoryId = queryObj.subCategory;
    }
    if (queryObj.brand) {
      where.brandId = queryObj.brand;
    }
    if (queryObj.available != undefined) {
      where.available = queryObj.available === "true";
    }

    if (queryObj.price) {
      const price = queryObj.price;
      where.price = {};
      if (price.gte) where.price[Op.gte] = +price.gte;
      if (price.lte) where.price[Op.lte] = +price.lte;
      if (price.gt) where.price[Op.gt] = +price.gt;
      if (price.lt) where.price[Op.lt] = +price.lt;
      if (price.equals) where.price[Op.eq] = +price.equals;
    }
    this.options.where = where;
    return this;
  }

  sort() {
    if (typeof this.queryString.sort === "string") {
      const sortBy = this.queryString.sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return [field.substring(1), "DESC"];
        } else {
          return [field, "ASC"];
        }
      });
      this.options.order = sortBy;
    } else {
      this.options.order = [["createdAt", "DESC"]];
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(",")
        .map((field) => field.trim());
      this.options.attributes = fields;
    }
    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.toLowerCase();

      if (modelName === "Product") {
        this.options.where[Op.or] = [
          where(fn("LOWER", col("title")), {
            [Op.like]: `%${keyword}%`,
          }),
          where(fn("LOWER", col("description")), {
            [Op.like]: `%${keyword}%`,
          }),
        ];
      } else {
        this.options.where[Op.or] = [
          where(fn("LOWER", col("name")), {
            [Op.like]: `%${keyword}%`,
          }),
        ];
      }
    }
    return this;
  }

  async paginate(documentCounts) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 5;
    const offset = (page - 1) * limit; // (2-1) * 5 = 5

    if (!this.queryString.page && !this.queryString.limit) {
      this.pagination = { total: documentCounts };
      return this;
    }

    this.options.limit = limit;
    this.options.offset = offset;
    this.page = page;

    // هان نحسب total count ونخزن بيانات الـ pagination
    const total =
      documentCounts || (await this.model.count({ where: this.options.where }));

    const pagination = {
      currentPage: page,
      limit,
      noOfPages: Math.ceil(total / limit),
      ...(offset > 0 && { prev: page - 1 }),
      ...(page * limit < total && { next: page + 1 }),
    };
    this.pagination = pagination;

    return this;
  }
}

module.exports = ApiFeatures;
