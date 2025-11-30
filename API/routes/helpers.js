import fs from 'fs';

const DB_PATH = './db.json';

export const readData = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
};

export const writeData = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing DB:', e.message);
  }
};
