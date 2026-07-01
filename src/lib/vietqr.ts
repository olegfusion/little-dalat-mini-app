import { config } from '../config';

interface QRData {
  imageUrl: string;
  content: string;
}

export function generateVietQR(orderId: number, amount: number): QRData {
  const napasString = buildNapasString(orderId, amount);

  return {
    imageUrl: `https://api.vietqr.io/image/${config.ocbAccountNumber}-compact2.jpg?amount=${amount}&addInfo=DH${orderId}&accountName=${encodeURIComponent(config.ocbBeneficiaryName)}`,
    content: napasString,
  };
}

function buildNapasString(orderId: number, amount: number): string {
  const beneficiary = config.ocbAccountNumber;
  const ref = `DH${orderId}`;
  return `${beneficiary}|${amount}|${ref}`;
}
