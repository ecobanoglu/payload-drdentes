/** Ana sayfa (`/{locale}`): `[...slug]` sayfasını segment olmadan, yani `home` ile render eder. */
import PageTemplate, { generateMetadata } from './[...slug]/page'

export default PageTemplate

export { generateMetadata }
