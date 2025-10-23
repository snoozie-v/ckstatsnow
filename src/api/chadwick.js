import axios from "axios";
import Papa from "papaparse";

export const fetchChadwickIdMap = async () => {
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
                  if (row.key_mlbam && row.key_bbref && !isNaN(row.key_mlbam)) {
                    map.set(parseInt(row.key_mlbam), row.key_bbref);
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
};
