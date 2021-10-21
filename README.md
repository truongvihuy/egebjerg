# Egebjerg Documentation

# Tech We Have Used

## Admin Dashboard

- CRA
- Apollo
- BaseUI
- Typescript
- React Hook Form

## Shop

- NextJs
- Apollo
- Typescript
- Styled Components
- Stripe Integration
- Formik

## API

- GraphQL
- Type GraphQL

# Getting Started & Installation

For getting started with the template you have to follow the below procedure. First navigate to the `egebjerg_fe` directory. Then run below command for getting started with specific part.

```bash
# on egebjerg_fe directory
yarn
```

## Admin

For starting the admin dashboard part with corresponding api data run below commands.

```bash
# for dev mode run below command
yarn dev:admin

```

## Shop

### Configuration

1. Go to `/packages/shop` folder.
1. Copy the contents of `.env.local.sample` into a new file called `.env.local`
1. Put Your Stripe public api key in the `/packages/shop/.env.local` file's `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` key.

For starting the shop part with corresponding api run below commands.

```bash
# for dev mode run below command
yarn dev:shop

```

### If you want to test your production build admin or shop in local environment then run the below commands.

## Admin

```bash
# build admin for production
yarn build:admin

# build api which in needed for local testing
yarn build:api

#start admin in production mode
yarn serve:admin
```

## Shop

```bash
# build shop for production
yarn build:shop

# build api which in needed for local testing
yarn build:api

# start shop in production mode
yarn serve:shop
```

# Folder Structure & Customization

`/packages/admin` : In this portion all the admin dashboard related coding and functions.

`/packages/shop` : All the shop related coding and functions.

`/packages/api` : API related code for both admin and shop section.

admin related api codes are in `admin` folder

shop related codes are in `shop` folder

# Configuration & Deployment

### Admin

- After deploying the api you will get the api endpoint url. Put that url in the `packages/admin/.env`
- also need to put it within `vercel.json` .

```
REACT_APP_API_URL={put_your_api_url_here}/admin/graphql;
```

- Navigate to `packages/admin`
- Now run below command

```bash
vercel
```

### Shop 

- After deploying the api you will get the api endpoint url. Put that url in the `packages/shop/.env.local` and `vercel.json` file.


```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY= 'put_your_stripe_public_key'

NEXT_PUBLIC_GRAPHQL_API_ENDPOINT= '{put_your_api_url_here.}/shop/graphql'
```

- Navigate to `packages/shop`
- Now run below command

```
vercel
```
