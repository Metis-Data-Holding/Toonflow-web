import {
  getRuntimeEndpointDefaults,
  isLegacyLocalApiBaseUrl,
  isLegacyLocalWsBaseUrl,
  normalizeApiBaseUrl,
  normalizeWsBaseUrl,
} from "@/utils/runtimeEndpoints";

export default defineStore(
  "setting",
  () => {
    const { baseUrl: defaultBaseUrl, wsBaseUrl: defaultWsBaseUrl } = getRuntimeEndpointDefaults();
    const baseUrl = ref<string>(defaultBaseUrl);
    const wsBaseUrl = ref<string>(defaultWsBaseUrl);

    const otherSetting = ref({
      axiosTimeOut: 60 * 10 * 1000,
      assetsBatchGenereateSize: 5,
    });

    const themeSetting = ref({
      mode: "light" as "light" | "dark" | "auto",
      primaryColor: "#9810fa",
    });

    function initializeEndpoints(options: { queryBaseUrl?: string; queryWsBaseUrl?: string } = {}) {
      const defaults = getRuntimeEndpointDefaults();
      const queryBaseUrl = normalizeApiBaseUrl(options.queryBaseUrl ?? "");
      const queryWsBaseUrl = normalizeWsBaseUrl(options.queryWsBaseUrl ?? "");

      if (queryBaseUrl) {
        baseUrl.value = queryBaseUrl;
      } else {
        const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl.value);
        if (!normalizedBaseUrl) {
          baseUrl.value = defaults.baseUrl;
        } else if (!import.meta.env.DEV && isLegacyLocalApiBaseUrl(normalizedBaseUrl)) {
          baseUrl.value = defaults.baseUrl;
        } else {
          baseUrl.value = normalizedBaseUrl;
        }
      }

      if (queryWsBaseUrl) {
        wsBaseUrl.value = queryWsBaseUrl;
      } else {
        const normalizedWsBaseUrl = normalizeWsBaseUrl(wsBaseUrl.value);
        if (!normalizedWsBaseUrl) {
          wsBaseUrl.value = defaults.wsBaseUrl;
        } else if (!import.meta.env.DEV && isLegacyLocalWsBaseUrl(normalizedWsBaseUrl)) {
          wsBaseUrl.value = defaults.wsBaseUrl;
        } else {
          wsBaseUrl.value = normalizedWsBaseUrl;
        }
      }
    }

    function setEndpoints(nextBaseUrl: string, nextWsBaseUrl: string) {
      const defaults = getRuntimeEndpointDefaults();
      baseUrl.value = normalizeApiBaseUrl(nextBaseUrl) || defaults.baseUrl;
      wsBaseUrl.value = normalizeWsBaseUrl(nextWsBaseUrl) || defaults.wsBaseUrl;
    }

    function resetEndpointsToDefaults() {
      const defaults = getRuntimeEndpointDefaults();
      baseUrl.value = defaults.baseUrl;
      wsBaseUrl.value = defaults.wsBaseUrl;
    }

    return { baseUrl, wsBaseUrl, otherSetting, themeSetting, initializeEndpoints, setEndpoints, resetEndpointsToDefaults };
  },
  { persist: true },
);
