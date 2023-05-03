/** @format */

import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    const setInitialTheme = `
      function getUserPreference() {
        if(window.localStorage.getItem('theme')) {
          const theme = JSON.parse(
            localStorage.getItem('theme') || '{}'
           );
          localStorage.removeItem('theme');
          return theme;

        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light'
      }
      document.body.dataset.theme = getUserPreference();
    `;
    const setInitialLanguage = `
      function getUserPreferenceLanguage() {
        if(window.localStorage.getItem('language')) {
          const language = JSON.parse(
            localStorage.getItem('language') || '{}'
           );
          localStorage.removeItem('language');
          return language;

        }

        let usrlang = navigator.language
                      || navigator.userLanguage;
        if (usrlang) {
          let usrLangMatch = usrlang.match('(de||DE||De)+')

          if (usrLangMatch) {
            usrlang = usrLangMatch[0] !== '' ? 'de' : 'en'
          } else {
            usrlang = 'en'
          }
        } else {
          usrlang = 'en'
        }

        return usrlang;
      }
      document.body.dataset.language = getUserPreferenceLanguage();
    `;
    return (
      <Html>
        <Head />
        <body>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
          <script dangerouslySetInnerHTML={{ __html: setInitialLanguage }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
