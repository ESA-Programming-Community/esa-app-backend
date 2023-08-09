import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define other paths or constants as needed
const rootDir = __dirname;

export default {
    rootDir,
    dotEnvFilePath: join(rootDir, '.env')
};
