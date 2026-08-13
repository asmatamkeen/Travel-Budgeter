// Returns { rate, lastUpdated } for converting `from` -> `to`, or null if
// the API doesn't recognize the target currency. Throws if the API itself
// is unreachable, so callers can tell "bad currency code" apart from
// "network/API failure" and respond with the right status code.
export async function getExchangeRate(from, to) {
  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();

  if (fromCode === toCode) {
    return { rate: 1, lastUpdated: null };
  }

  const response = await fetch(`https://open.er-api.com/v6/latest/${fromCode}`);

  if (!response.ok) {
    throw new Error(`Exchange rate API responded with ${response.status}`);
  }

  const data = await response.json();
  const rate = data.rates?.[toCode];

  if (rate === undefined) {
    return null;
  }

  return { rate, lastUpdated: data.time_last_update_utc || null };
}
