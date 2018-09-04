import Page from "~/src/app/vendors/pages/Page";
import { URL } from "url";
import logger from "~/src/app/modules/logger/page";

class LazadaThankYouPage extends Page {
  constructor(driver, url) {
    const base = ".order-summary .checkout-summary";

    super(driver, url, {
      orderNumber: ".thank-you-order-number",
      checkoutSummary: {
        icon: `${base} .checkout-summary-icon`,
        subTotal: `${base} .checkout-summary-row:first-child .checkout-summary-value`,
        shippingFee: `${base} .checkout-summary-row:nth-child(2) .checkout-summary-value`,
        shippingFeeDiscount: `${base} .checkout-summary-row:nth-child(3) .checkout-summary-value`,
        total: `${base} .order-summary-row-total .checkout-summary-value`
      },
      deliveryDate:
        ".payment-information.item:nth-child(2) .content span.strong-text"
    });

    this.info = {
      orderNumber: undefined,
      price: {
        total: undefined,
        products: undefined,
        shipping: undefined,
        shippingDiscount: undefined
      },
      deliveryDate: undefined
    };
  }

  getCheckoutNumber = async () => {
    logger.debug("LazadaThankYouPage.getCheckoutNumber()");
    let orderNumber = await this._getText("orderNumber");

    if (!orderNumber) {
      const url = new URL(await this.driver.getCurrentUrl());

      orderNumber = url.searchParams.get("orderId");
    }

    this.info.orderNumber = orderNumber;

    return orderNumber;
  };

  getDeliveryDate = async () => {
    logger.debug("LazadaThankYouPage.getDeliveryDate()");
    const result = await this._getText("deliveryDate");

    this.info.deliveryDate = result;

    return result;
  };

  getCheckoutSummary = async () => {
    logger.debug("LazadaThankYouPage.getCheckoutSummary()");
    // Open checkout summary panel.
    await this._click("checkoutSummary.icon");

    const results = await Promise.all([
      this.getProductsPrice(),
      this.getShippingFee(),
      this.getShippingFeeDiscount(),
      this.getTotalPrice()
    ]);

    return {
      productPrice: results[0],
      shippingFee: results[1],
      shippingFeeDiscount: results[2],
      totalPrice: results[3]
    };
  };

  getProductsPrice = async () => {
    logger.debug("- LazadaThankYouPage.getProductsPrice()");
    const result = await this._getPrice("checkoutSummary.subTotal");

    this.info.price.products = result;

    return result;
  };

  getShippingFee = async () => {
    logger.debug("- LazadaThankYouPage.getShippingFee()");
    const result = await this._getPrice("checkoutSummary.shippingFee");

    this.info.price.shippingFee = result;

    return result;
  };

  getShippingFeeDiscount = async () => {
    logger.debug("- LazadaThankYouPage.getShippingFeeDiscount()");
    const result = await this._getPrice("checkoutSummary.shippingFeeDiscount");

    this.info.price.shippingFeeDiscount = result;

    return result;
  };

  getTotalPrice = async () => {
    logger.debug("- LazadaThankYouPage.getTotalPrice()");
    const result = await this._getPrice("checkoutSummary.total");

    this.info.price.total = result;

    return result;
  };

  _getPrice = async selectorKey => {
    return await this._getText(selectorKey, text =>
      Number(text.replace(/[^0-9.-]+/g, ""))
    );
  };
}

export default LazadaThankYouPage;