import App from 'next/app';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import metrics from '../metrics';
import { pageview, event } from '../utility/analytics';
import Layout from '../components/common/layout';
import { useRouter } from 'next/router';
/**
 * Handles the Vitals and Metrics of the Webapp
 * @param {Object} metric
 */
export const reportWebVitals = (metric) => metrics(metric);

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };
    if (window !== undefined && window.gtag) {
      //When the component is mounted, subscribe to router changes
      //and log those page views
      router.events.on('routeChangeComplete', handleRouteChange);

      // If the component is unmounted, unsubscribe
      // from the event with the `off` method
    }
    return () => {
      if (window !== undefined && window.gtag)
        router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
        <meta name="robots" content="index, follow"></meta>
        <meta charset="UTF-8"></meta>
        <meta
          name="description"
          content="MOIKAPY.DEV: A Minimalistic web2.0/web3.0 site created to Display the NFT Collection of moikapy.eth and Provide for NFT Holders and NFT Collectors who utilize the Matic Network."
        />
        <title>
          MOIKAPY {router.pathname !== '/' ? router.pathname.toUpperCase() : ''}
        </title>
      </Head>

      <Provider session={pageProps.session} store={store}>
        {/* <ThemeProvider theme={theme}> */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
        {/* </ThemeProvider> */}
      </Provider>
    </>
  );
}

export default MyApp;
