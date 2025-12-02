import { modelData as modelDataFromSource } from './model-data';

// This file now simply re-exports the data from a dedicated source file.
// This prevents server-side rendering issues caused by complex object creation at the module level.
export const modelData = modelDataFromSource;
