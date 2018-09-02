import PlaceOrderPage from "~/src/app/vendors/Lazada/pages/PlaceOrder";
import Pipeline from "~/src/app/modules/task/Pipeline";

const placeOrder = async (driver, data) => {
  const page = new PlaceOrderPage(driver);
  const p = new Pipeline();
  const vouchers = data.voucher || [];

  // Load page.
  p.add(async (ctx, next) => {
    console.log("- Loading page.");
    if (await page.load("Cart is empty.")) {
      console.log("-- loaded");
      next();
    }
  });

  p.add(async (ctx, next) => {
    console.log("- Get order summary.");

    const orderSummary = await page.getOrderSummary();

    console.log(orderSummary);

    p.setInfo("order", { price: page.info.price });

    next();
  });

  if (vouchers.length > 0) {
    p.add(async (ctx, next) => {
      console.log(` - Apply ${vouchers.length} voucher(s).`);

      for (let voucher of vouchers) {
        await page.applyVoucher(voucher);
      }
    });
  }

  p.add(async (ctx, next) => {
    console.log("- Place order.");
    await page.placeOrder();
    next();
  });

  return await p.perform();
};

export default placeOrder;
