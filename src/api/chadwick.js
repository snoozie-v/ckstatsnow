import axios from "axios";
import Papa from "papaparse";

// Memoization for the main ID map to avoid re-fetching on every call.
let chadwickIdMapPromise = null;

export const fetchChadwickIdMap = () => {
  if (chadwickIdMapPromise) {
    return chadwickIdMapPromise;
  }

  chadwickIdMapPromise = (async () => {
    const map = new Map();
    const promises = [];

    for (let i = 0; i < 16; i++) {
      const suffix = i.toString(16);
      const url = `https://raw.githubusercontent.com/chadwickbureau/register/master/data/people-${suffix}.csv`;
      promises.push(
        axios.get(url).then(
          (response) =>
            new Promise((resolve, reject) => {
              Papa.parse(response.data, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  results.data.forEach((row) => {
                    if (
                      row.key_mlbam &&
                      row.key_bbref &&
                      !isNaN(row.key_mlbam)
                    ) {
                      map.set(parseInt(row.key_mlbam, 10), row.key_bbref);
                    }
                  });
                  resolve();
                },
                error: (err) => reject(err),
              });
            })
        )
      );
    }
    await Promise.all(promises);
    return map;
  })();

  return chadwickIdMapPromise;
};

// Cache for individual player lookups to avoid repeated map lookups.
const chadwickPlayerCache = new Map();

export const fetchChadwickPlayerId = async (mlbId) => {
  const numericMlbId = parseInt(mlbId, 10);
  if (chadwickPlayerCache.has(numericMlbId)) {
    return chadwickPlayerCache.get(numericMlbId);
  }

  const idMap = await fetchChadwickIdMap();
  const chadwickId = idMap.get(numericMlbId);

  chadwickPlayerCache.set(numericMlbId, chadwickId);
  return chadwickId;
};
