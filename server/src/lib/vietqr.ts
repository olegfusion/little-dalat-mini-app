import { config } from '../config';

interface QRData {
  imageUrl: string;
  content: string;
}

export function generateVietQR(orderId: number, amount: number): QRData {
  const napasString = buildNapasString(orderId, amount);

  return {
    imageUrl: `https://api.vietqr.io/image/${config.bankCode}-${config.bankAccountNumber}-compact2.jpg?amount=${amount}&addInfo=DH${orderId}&accountName=${encodeURIComponent(config.bankBeneficiaryName)}`,
    content: napasString,
  };
}

function buildNapasString(orderId: number, amount: number): string {
  const ref = `DH${orderId}`;
  const beneficiary = `${config.bankCode} ${config.bankAccountNumber}`;
  return `${beneficiary}|${amount}|${ref}`;
}
