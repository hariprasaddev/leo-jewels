import type { PolicyPage } from "@/types";

/**
 * Default policy copy. Every page is editable from the admin console
 * (`/admin/content`) and persisted locally. Placeholders such as
 * `{{supportEmail}}` are replaced at render time with the value configured in
 * store settings, so the owner never has to repeat contact details here.
 */
export const policyPages: PolicyPage[] = [
  {
    kind: "shipping",
    title: "Shipping Policy",
    eyebrow: "Orders & delivery",
    description:
      "How LEO JEWELS prepares, dispatches and delivers your order.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Dispatch timelines",
        body: [
          "In-stock orders are packed and handed to our courier partner within two business days. Orders containing multiple pieces may be split across dispatches at no extra cost.",
          "You will receive tracking details by email and SMS once the parcel leaves our studio.",
        ],
      },
      {
        heading: "Delivery estimates",
        body: [
          "Delivery time depends on the destination pin code and the courier partner. Metro cities are typically quicker than remote service areas.",
          "Estimates are shown at checkout where available and are not a guaranteed delivery date.",
        ],
      },
      {
        heading: "Shipping charges",
        body: [
          "Shipping is complimentary on orders above the free-shipping threshold shown in the cart. A flat fee applies below that threshold and is displayed before payment.",
        ],
      },
      {
        heading: "Undeliverable parcels",
        body: [
          "If a parcel is returned to us because the address was incomplete or delivery was refused, our team will contact you to arrange re-dispatch. Additional shipping charges may apply.",
        ],
      },
    ],
  },
  {
    kind: "returns",
    title: "Returns & Exchanges",
    eyebrow: "After your order",
    description:
      "What to do if a piece is not right, and how returns are assessed.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Return eligibility",
        body: [
          "Returns and exchanges are accepted for unused pieces in their original packaging with tags intact. The applicable return window is confirmed on your order summary and by our support team.",
          "Pieces that have been worn, altered, cleaned or damaged after delivery are not eligible.",
        ],
      },
      {
        heading: "How to request a return",
        body: [
          "Write to {{supportEmail}} with your order number and a short description of the issue, attaching photographs where relevant. Our team will respond with return instructions.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Once the returned piece is received and inspected, the refund is processed to the original payment method. Bank processing times are outside our control.",
          "Shipping charges already paid are not refundable unless the return is due to an error on our part.",
        ],
      },
      {
        heading: "Exclusions",
        body: [
          "Customised, made-to-order and pierced-earring items may not be returnable for hygiene or production reasons. Any such restriction is stated on the product page.",
        ],
      },
    ],
  },
  {
    kind: "cancellation",
    title: "Cancellation Policy",
    eyebrow: "Changing your mind",
    description: "How to cancel an order before it is dispatched.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Before dispatch",
        body: [
          "You may request cancellation before your order is handed to the courier. Contact {{supportEmail}} with your order number as soon as possible.",
          "Where the request reaches us in time, the order is cancelled and any amount paid is refunded to the original payment method.",
        ],
      },
      {
        heading: "After dispatch",
        body: [
          "Once a parcel is in transit it cannot be cancelled. You may refuse delivery or initiate a return under the Returns & Exchanges policy instead.",
        ],
      },
      {
        heading: "Cancellations by us",
        body: [
          "In the rare case that we cannot fulfil an order — for example because a piece is unavailable or a payment cannot be verified — we will cancel it and refund the full amount paid.",
        ],
      },
    ],
  },
  {
    kind: "payment",
    title: "Payment Policy",
    eyebrow: "Ways to pay",
    description:
      "Accepted payment methods, verification and how charges appear.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Accepted methods",
        body: [
          "Online payments are processed through our payment gateway partner. Available methods are shown at checkout and may include UPI, credit and debit cards, and net banking.",
          "Cash on delivery is available only where the service is offered for your pin code.",
        ],
      },
      {
        heading: "Verification",
        body: [
          "Online payments are confirmed by the payment gateway before an order is accepted. An order is not treated as paid until this confirmation is received.",
          "If a payment is debited but the order is not confirmed, contact {{supportEmail}} with the transaction reference so we can reconcile it.",
        ],
      },
      {
        heading: "Pricing and taxes",
        body: [
          "Prices are shown in Indian Rupees. Applicable taxes are calculated at checkout and displayed in the order summary before payment.",
          "Product prices and offers may change without notice; the price shown at the time of order confirmation applies.",
        ],
      },
      {
        heading: "Chargebacks",
        body: [
          "Please contact us before raising a chargeback so that we can resolve the issue directly. Chargebacks raised without contacting us may delay resolution.",
        ],
      },
    ],
  },
  {
    kind: "privacy",
    title: "Privacy Policy",
    eyebrow: "Your data",
    description:
      "What information we collect, why we collect it, and the choices you have.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "When you place an order we collect the details needed to fulfil it: name, delivery address, email address and mobile number. Account holders also store a hashed password.",
          "Payment card details are entered directly with the payment gateway and are not stored by us.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "Order details are used to process, pack and deliver your purchase and to provide support. With your consent, your email address may be used to send new-collection updates; you can unsubscribe at any time.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "We share delivery details with our courier partners and payment information with our payment gateway strictly to complete your order. We do not sell personal information.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "You can request access to, correction of, or deletion of your personal information by writing to {{supportEmail}}. Some records may be retained where required for accounting or legal purposes.",
        ],
      },
    ],
  },
  {
    kind: "terms",
    title: "Terms & Conditions",
    eyebrow: "Using this store",
    description:
      "The terms that apply when you browse or purchase from LEO JEWELS.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "About this store",
        body: [
          "This store is operated under the LEO JEWELS brand. Business registration details, the registered address and applicable tax identifiers are published here once configured by the store owner.",
          "Contact details for the store are listed on the Contact page.",
        ],
      },
      {
        heading: "Products and photography",
        body: [
          "We describe each piece as accurately as we can. Colours may appear slightly different depending on your screen. Metal tones, plating and stones are stated on the product page; no purity, hallmark or certification claim is made unless explicitly listed.",
        ],
      },
      {
        heading: "Orders",
        body: [
          "An order is accepted when we confirm it and, for online payments, when payment is verified. We may decline or cancel an order where a piece is unavailable, pricing is clearly incorrect, or fraud is suspected.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "The LEO JEWELS name, logo, product photography and site content are owned by the brand and may not be reproduced without permission.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws applicable in the jurisdiction configured by the store owner. Any placeholder text on this page should be reviewed by the owner before launch.",
        ],
      },
    ],
  },
];
