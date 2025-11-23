// Currency conversion: 1 Sbtc = 0.0000001 BTC
export const SBTC_TO_BTC_RATIO = 0.0000001;
export const BTC_TO_SBTC_RATIO = 10000000;

export function btcToSbtc(btc: number): number {
  return btc * BTC_TO_SBTC_RATIO;
}

export function sbtcToBtc(sbtc: number): number {
  return sbtc * SBTC_TO_BTC_RATIO;
}

export function formatBtc(btc: number): string {
  return btc.toFixed(8);
}

export function formatSbtc(sbtc: number): string {
  return sbtc.toFixed(2);
}

