import React from 'react';
import { formatCurrency } from './formatters';

const BundleCard = ({ bundle }) => {
  return (
    <div className="bundle-card">
      <h3>{bundle.name}</h3>
      <div className="bundle-price">
        {formatCurrency(bundle.total_price, bundle.currency)}
      </div>
      <div className="bundle-products">
        <h4>Included Products:</h4>
        <ul>
          {bundle.products.map((product, index) => (
            <li key={index}>
              {product.name} - {formatCurrency(product.price, product.currency)}
            </li>
          ))}
        </ul>
      </div>
      {bundle.savings && (
        <div className="bundle-savings">
          Save {formatCurrency(bundle.savings, bundle.currency)}!
        </div>
      )}
    </div>
  );
};

export default BundleCard;