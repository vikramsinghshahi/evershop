import { select } from '@evershop/postgres-query-builder';
import { translate } from '../../../../lib/locale/translate/translate.js';
import { error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { setContextValue } from '../../../graphql/services/contextHelper.js';
import { PrintScaleError } from '../../../fabric/services/printScale.js';
import { resolveFabricCartOptions } from '../../../fabric/services/printDesignFile.js';
import { createNewCart } from '../../services/createNewCart.js';
import { getMyCart } from '../../services/getMyCart.js';
import { saveCart } from '../../services/saveCart.js';

export default async (request: EvershopRequest, response, next) => {
  try {
    const { sessionID, customer } = request.locals;
    let myCart = await getMyCart(sessionID || '', customer?.customer_id);
    if (!myCart) {
      // Create a new cart
      myCart = await createNewCart(sessionID || '', customer || {});
    }
    const { sku, qty } = request.body;

    // Load the product by sku
    const product = await select()
      .from('product')
      .where('sku', '=', sku)
      .and('status', '=', 1)
      .load(pool);

    if (!product) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: translate('Product not found')
        }
      });
      return;
    }

    let printConfiguration: string | null = null;
    try {
      printConfiguration = await resolveFabricCartOptions(product.sku, {
        scale: request.body?.scale,
        design: request.body?.design,
        mode: request.body?.mode,
        printFee: product.print_fee
      });
    } catch (scaleError) {
      if (scaleError instanceof PrintScaleError) {
        response.status(INVALID_PAYLOAD);
        response.json({
          error: {
            status: INVALID_PAYLOAD,
            message: scaleError.message
          }
        });
        return;
      }
      throw scaleError;
    }

    // If everything is fine, add the product to the cart
    const item = await myCart.addItem(product.product_id, parseInt(qty, 10), {
      request,
      printConfiguration
    });
    await saveCart(myCart);
    response.status(OK);
    response.$body = {
      data: {
        item: item.export(),
        count: myCart.getData('total_qty'),
        cartId: myCart.getData('uuid')
      }
    };
    next();
  } catch (e) {
    error(e);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: (e as Error)?.message
      }
    });
  }
};
