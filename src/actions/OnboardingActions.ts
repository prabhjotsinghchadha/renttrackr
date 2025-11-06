'use server';

import { getUserLeases } from '@/actions/LeaseActions';
import { getUserOwners } from '@/actions/OwnerActions';
import { getPropertyCount } from '@/actions/PropertyActions';
import { getTenantCount, getUserTenants } from '@/actions/TenantActions';
import { requireAuth } from '@/helpers/AuthHelper';

export type OnboardingStep = {
  key: 'owner' | 'property' | 'tenant' | 'lease';
  title: string;
  description: string;
  complete: boolean;
  ctaHref: string;
  ctaText: string;
};

export type OnboardingStatus = {
  ownerCount: number;
  propertyCount: number;
  tenantCount: number;
  leaseCount: number;
  steps: OnboardingStep[];
  isComplete: boolean;
  showWelcome: boolean;
};

/**
 * Get onboarding status for the current user
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  try {
    await requireAuth();

    // Get counts
    const ownerResult = await getUserOwners();
    const ownerCount = ownerResult.success && ownerResult.owners ? ownerResult.owners.length : 0;
    const propertyCount = await getPropertyCount();
    const tenantCount = await getTenantCount();
    const leaseResult = await getUserLeases();
    const leaseCount = leaseResult.success && leaseResult.leases ? leaseResult.leases.length : 0;

    // Get first tenant ID for lease creation link (if tenants exist but no leases)
    let leaseCtaHref = '/dashboard/tenants';
    let leaseCtaText = 'Add Tenant First';
    if (tenantCount > 0) {
      const tenantsResult = await getUserTenants();
      if (tenantsResult.success && tenantsResult.tenants && tenantsResult.tenants.length > 0) {
        const firstTenant = tenantsResult.tenants[0];
        if (firstTenant?.id) {
          leaseCtaHref = `/dashboard/tenants/${firstTenant.id}`;
          leaseCtaText = 'Add Lease';
        }
      }
    }

    // Define steps
    const steps: OnboardingStep[] = [
      {
        key: 'owner',
        title: 'Add Owner',
        description: 'Create an owner (you or your LLC) to organize your properties',
        complete: ownerCount > 0,
        ctaHref: '/dashboard/owners',
        ctaText: 'Add Owner',
      },
      {
        key: 'property',
        title: 'Add Property',
        description: 'Add your first rental property to start tracking',
        complete: propertyCount > 0,
        ctaHref: '/dashboard/properties/new',
        ctaText: 'Add Property',
      },
      {
        key: 'tenant',
        title: 'Add Tenant',
        description: 'Add tenants to track leases and payments',
        complete: tenantCount > 0,
        ctaHref: '/dashboard/tenants/new',
        ctaText: 'Add Tenant',
      },
      {
        key: 'lease',
        title: 'Add Lease',
        description: 'Create a lease for your tenant to enable rent tracking',
        complete: leaseCount > 0,
        ctaHref: leaseCtaHref,
        ctaText: leaseCtaText,
      },
    ];

    const isComplete = steps.every((step) => step.complete);
    const showWelcome = ownerCount === 0 && propertyCount === 0 && tenantCount === 0 && leaseCount === 0;

    return {
      ownerCount,
      propertyCount,
      tenantCount,
      leaseCount,
      steps,
      isComplete,
      showWelcome,
    };
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    // Return default empty state
    return {
      ownerCount: 0,
      propertyCount: 0,
      tenantCount: 0,
      leaseCount: 0,
      steps: [
        {
          key: 'owner',
          title: 'Add Owner',
          description: 'Create an owner to organize your properties',
          complete: false,
          ctaHref: '/dashboard/owners',
          ctaText: 'Add Owner',
        },
        {
          key: 'property',
          title: 'Add Property',
          description: 'Add your first rental property',
          complete: false,
          ctaHref: '/dashboard/properties/new',
          ctaText: 'Add Property',
        },
        {
          key: 'tenant',
          title: 'Add Tenant',
          description: 'Add tenants to track leases',
          complete: false,
          ctaHref: '/dashboard/tenants/new',
          ctaText: 'Add Tenant',
        },
        {
          key: 'lease',
          title: 'Add Lease',
          description: 'Create a lease for your tenant',
          complete: false,
          ctaHref: '/dashboard/tenants',
          ctaText: 'Add Lease',
        },
      ],
      isComplete: false,
      showWelcome: true,
    };
  }
}

