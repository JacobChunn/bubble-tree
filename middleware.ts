import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer } from '@/utils/amplify-utils';
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  //console.log("IN MIDDLEWARE!!!")

  // If a user is logged in and accessing home, aka root or '/',
  // redirect them to their own user page 
  if (request.nextUrl.pathname == "/") {
    //console.log("IN MIDDLEWARE IF!!!")
    //const currentUser = await AuthGetCurrentUserServer();
    const userAttributes = await AuthFetchUserAttributesServer();

    if (userAttributes && userAttributes.preferred_username) {
      const userURLString = '/user/' + userAttributes.preferred_username

      return NextResponse.redirect(new URL(userURLString, request.url))
    }
  }

  return NextResponse.next()
}