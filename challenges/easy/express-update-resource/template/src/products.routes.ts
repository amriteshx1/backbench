import { Router } from "express";
const products = [{ id: "p1", name: "Laptop", price: 999 }];
export const router = Router();

router.patch("/products/:id", (req, res) => {
  // TODO: find product, merge req.body, return 404 or 200
  return res.status(200).json(products[0]);
});
