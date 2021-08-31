import Document, { Html, Head, Main, NextScript } from 'next/document';
import { getLangFromReq } from '../utility/fromReq';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const lang = getLangFromReq(ctx.req);
    return { ...initialProps, lang };
  }
  /* eslint-disable */
  render() {
    return (
      <Html lang={this.props.lang}>
        <Head>
          <meta name="Description" content="An NFT Oasis"></meta>
          <meta name="theme-color" content="#474c59" />

          <link rel="icon" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
          <link
            href="/favicon-16x16.png"
            rel="icon"
            type="image/png"
            sizes="16x16"
          />
          <link
            href="/favicon-32x32.png"
            rel="icon"
            type="image/png"
            sizes="32x32"
          />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png"></link>
        </Head>
        <body>
          <Main />
          <NextScript />
          <script
            type="text/javascript"
            src="//www.privacypolicies.com/public/cookie-consent/4.0.0/cookie-consent.js"
            charset="UTF-8"></script>
          <script
            type="text/javascript"
            charset="UTF-8"
            dangerouslySetInnerHTML={{
              __html: `document.addEventListener('DOMContentLoaded', function () {
              cookieconsent.run({ "notice_banner_type": "footer", "consent_type": "express", "palette": "dark", "language": "en", "page_load_consent_levels": ["strictly-necessary"], "notice_banner_reject_button_hide": false, "preferences_center_close_button_hide": false, "website_name": "LAZY NFT APP", "open_preferences_center_selector": "open_preferences_center" });});`,
            }}
          />
          <script
            type="text/plain"
            cookie-consent="tracking"
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />{' '}
          {/*// eslint-disable-line no-console*/}
          <script
            type="text/plain"
            cookie-consent="tracking"
            async
            data-ad-client={`ca-pub-${process.env.ADSENSE_KEY}`}
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js`}
            crossOrigin="anonymous"></script>
          {/*// eslint-disable-line no-console*/}
          <script
            type="text/plain"
            cookie-consent="tracking"
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
          <noscript>
            Cookie Consent by{' '}
            <a
              href="https://www.PrivacyPolicies.com/cookie-consent/"
              rel="nofollow noopener">
              PrivacyPolicies.com
            </a>
          </noscript>
        </body>
      </Html>
    ); // eslint-disable-line no-console
  }
}

export default MyDocument;
