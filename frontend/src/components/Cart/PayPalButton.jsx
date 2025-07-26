import {PayPalButtons, PayPalScriptProvider, } from "@paypal/react-paypal-js";


const PayPalButton = ({amount, onSuccess, onError}) => {
  return (
    <div>
        <PayPalScriptProvider options={{"clientId": "AXsH8UNtz2BKJ-aaqhi6Lzab_wZzXQQuE4oYve8IBqQhBDPJBwTLaj--i31bBfkx91JlQRwwiolD7W_q"}}>
            <PayPalButtons style={{layout: "vertical"} } createOrder={(data, actions) => {
                return actions.order.create({
                    purchase_units:[{amount: {value: amount}}]
                })

            }}
            onApprove={(data, actions) => {
                return actions.order.capture().then(onSuccess)
            }}
            onError={onError}/>
        </PayPalScriptProvider>
    </div>
  )
}

export default PayPalButton