<?php

namespace Maizied\RoastApi;

/**
 * RaaS — Roast as a Service PHP Client
 *
 * A lightweight PHP client for fetching developer roasts from the
 * RaaS static JSON API hosted on GitHub Pages.
 *
 * @package maizied/roast-api
 * @author  Maizied <mdshuvo40@gmail.com>
 * @license MIT
 * @link    https://maijied.github.io/roast-as-a-service/
 */
class RaaS
{
    private const BASE_URL = 'https://maijied.github.io/roast-as-a-service/api';

    /** @var array|null In-memory manifest cache */
    private static ?array $manifestCache = null;

    /** @var array<string, array> In-memory shard cache */
    private static array $shardCache = [];

    /**
     * Fetch the API manifest.
     *
     * @return array Decoded manifest data
     * @throws \RuntimeException If the fetch fails
     */
    public static function getManifest(): array
    {
        if (self::$manifestCache !== null) {
            return self::$manifestCache;
        }

        $url = self::BASE_URL . '/manifest.json';
        $json = @file_get_contents($url);

        if ($json === false) {
            throw new \RuntimeException("Failed to fetch manifest from {$url}");
        }

        self::$manifestCache = json_decode($json, true);
        return self::$manifestCache;
    }

    /**
     * Fetch a specific shard.
     *
     * @param string $lang  Language code (e.g., 'en', 'bn')
     * @param int    $shard Shard number (default: 1)
     * @return array Decoded shard data
     * @throws \RuntimeException If the fetch fails
     */
    public static function getShard(string $lang = 'en', int $shard = 1): array
    {
        $key = "{$lang}-{$shard}";

        if (isset(self::$shardCache[$key])) {
            return self::$shardCache[$key];
        }

        $url = self::BASE_URL . "/{$lang}/roasts-{$lang}-{$shard}.json";
        $json = @file_get_contents($url);

        if ($json === false) {
            throw new \RuntimeException("Failed to fetch shard from {$url}");
        }

        self::$shardCache[$key] = json_decode($json, true);
        return self::$shardCache[$key];
    }

    /**
     * Get a random roast.
     *
     * @param array $options {
     *     @type string $lang      Language code ('en' or 'bn'). Default: 'en'.
     *     @type int    $intensity Filter by intensity (1–3). Default: null (any).
     *     @type int    $maxLength Maximum text length. Default: null (any).
     * }
     * @return array Roast object with keys: id, text, intensity, length
     * @throws \RuntimeException If fetch fails or no roasts match filters
     */
    public static function getRandomRoast(array $options = []): array
    {
        $lang = $options['lang'] ?? 'en';
        $intensity = $options['intensity'] ?? null;
        $maxLength = $options['maxLength'] ?? null;

        $shard = self::getShard($lang);
        $roasts = $shard['roasts'] ?? [];

        // Apply filters
        if ($intensity !== null) {
            $roasts = array_filter($roasts, fn($r) => ($r['intensity'] ?? 0) === $intensity);
        }
        if ($maxLength !== null) {
            $roasts = array_filter($roasts, fn($r) => ($r['length'] ?? 0) <= $maxLength);
        }

        $roasts = array_values($roasts);

        if (empty($roasts)) {
            throw new \RuntimeException('No roasts match the given filters.');
        }

        return $roasts[array_rand($roasts)];
    }

    /**
     * Get all roasts for a language.
     *
     * @param string $lang Language code. Default: 'en'.
     * @return array List of roast objects
     */
    public static function getAllRoasts(string $lang = 'en'): array
    {
        $shard = self::getShard($lang);
        return $shard['roasts'] ?? [];
    }

    /**
     * Clear the in-memory cache.
     */
    public static function clearCache(): void
    {
        self::$manifestCache = null;
        self::$shardCache = [];
    }
}
