const keyBloom = (key: string): number => 1 << key.charCodeAt(0) % 31;
