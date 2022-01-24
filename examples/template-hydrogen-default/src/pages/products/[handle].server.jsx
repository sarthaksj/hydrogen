import {useShopQuery, ProductProviderFragment} from '@shopify/hydrogen';
import gql from 'graphql-tag';

import ProductSeo from '../../components/ProductSeo.client';
import ProductDetails from '../../components/ProductDetails.client';
import NotFound from '../../components/NotFound.server';
import Layout from '../../components/Layout.server';

export default function Product({country = {isoCode: 'US'}, params}) {
  const {handle} = params;

  const {
    data: {
      product,
      shop: {
        primaryDomain: {url: shopUrl},
      },
    },
  } = useShopQuery({
    query: QUERY,
    variables: {
      country: country.isoCode,
      handle,
    },
  });

  if (!product) {
    return <NotFound />;
  }

  return (
    <Layout>
      <ProductSeo product={product} shopUrl={shopUrl} />
      <ProductDetails product={product} />
    </Layout>
  );
}

const QUERY = gql`
  query product(
    $country: CountryCode
    $handle: String!
    $includeReferenceMetafieldDetails: Boolean = true
    $numProductMetafields: Int = 20
    $numProductVariants: Int = 250
    $numProductMedia: Int = 6
    $numProductVariantMetafields: Int = 10
    $numProductVariantSellingPlanAllocations: Int = 0
    $numProductSellingPlanGroups: Int = 0
    $numProductSellingPlans: Int = 0
  ) @inContext(country: $country) {
    shop {
      primaryDomain {
        url
      }
    }
    product: product(handle: $handle) {
      id
      description
      vendor
      seo {
        title
        description
      }
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
      ...ProductProviderFragment
    }
  }

  ${ProductProviderFragment}
`;
