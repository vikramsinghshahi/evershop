import crypto from 'crypto';
import { insert, select } from '@evershop/postgres-query-builder';
import { translate } from '../../../../lib/locale/translate/translate.js';
import { error, warning } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import { OK, INTERNAL_SERVER_ERROR } from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import {
  isResetMailReady,
  sendResetPasswordEmail
} from '../../services/sendResetPasswordEmail.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  const { body } = request;
  const { email } = body;
  try {
    // Store-wide: does not leak whether this address has an account.
    // The reset URL stays in the email and is never returned in the JSON.
    const emailSent = await isResetMailReady();

    if (emailSent) {
      const token = crypto.randomBytes(64).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const existingCustomer = await select()
        .from('customer')
        .where('email', '=', email)
        .load(pool);

      if (existingCustomer) {
        await insert('reset_password_token')
          .given({
            customer_id: existingCustomer.customer_id,
            token: hash
          })
          .execute(pool);

        try {
          await sendResetPasswordEmail(email, existingCustomer, token);
        } catch (e) {
          error(e);
          warning('Reset password email failed to send.');
        }
      }
    }

    response.status(OK);
    response.json({
      data: {
        emailSent
      }
    });

    return;
  } catch (e) {
    error(e);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: translate('Something went wrong. Please try again later.')
      }
    });
  }
};
