const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Update Booking model
content = content.replace(
  /otherGuests     Json\?\r?\n\s+createdAt DateTime @default\(now\(\)\)/,
  `otherGuests     Json?
  
  promoCode       String?
  discountAmount  Float?    @default(0)
  
  createdAt DateTime @default(now())`
);

// Update Tour model
content = content.replace(
  /model Tour \{[\s\S]*?reviews\s+Review\[\]\r?\n\}/,
  (match) => match.replace(/reviews\s+Review\[\]\r?\n\}/, `reviews         Review[]\n  promoCodes      PromoCode[]\n}`)
);

// Append PromoCode model
const promoModel = `
model PromoCode {
  id              String   @id @default(cuid())
  code            String   @unique
  discountPercent Float
  tourId          String?
  tour            Tour?    @relation(fields: [tourId], references: [id], onDelete: SetNull)
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tourId])
  @@index([code])
}
`;

if (!content.includes('model PromoCode')) {
  content += promoModel;
}

fs.writeFileSync('prisma/schema.prisma', content);
console.log('Schema updated successfully');
