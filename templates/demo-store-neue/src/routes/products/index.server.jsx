import {useShopQuery, gql, useLocalization} from '@shopify/hydrogen';

import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {Layout, ProductGrid, PageHeader, Section} from '~/components';

const pageBy = 12;

export default function AllProducts() {
  const {
    language: {isoCode: languageCode},
    country: {isoCode: countryCode},
  } = useLocalization();

  const {data} = useShopQuery({
    query: ALL_PRODUCTS_QUERY,
    variables: {
      country: countryCode,
      language: languageCode,
      pageBy,
    },
    preload: true,
  });

  const products = data.products;

  return (
    <Layout>
      <PageHeader heading="All Products" variant="allCollections" />
      <Section>
        <ProductGrid
          url={`/products?country=${countryCode}`}
          collection={{products}}
        />
      </Section>
    </Layout>
  );
}

// pagination api
export async function api(request, {params, queryShop}) {
  if (request.method !== 'POST') {
    return new Response(405, {Allow: 'POST'});
  }

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const country = url.searchParams.get('country');
  const {handle} = params;

  return await queryShop({
    query: PAGINATE_QUERY,
    variables: {
      handle,
      cursor,
      pageBy,
      country,
    },
  });
}

const ALL_PRODUCTS_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $pageBy, after: $cursor) {
      nodes {
        ...ProductCardFields
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

const PAGINATE_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query ProductsPage(
    $pageBy: Int!
    $cursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $pageBy, after: $cursor) {
      nodes {
        ...ProductCardFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
