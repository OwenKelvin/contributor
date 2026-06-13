import { Component, inject, signal, OnInit, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '@nyots/data-source/projects';
import { ContactService } from '@nyots/data-source/contact';
import { HlmButton } from '@nyots/ui/button';
import { HlmInput } from '@nyots/ui/input';
import { HlmTextarea } from '@nyots/ui/textarea';
import { HlmLabel } from '@nyots/ui/label';
import { HlmBadge } from '@nyots/ui/badge';
import { HlmIcon } from '@nyots/ui/icon';
import { provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideHeart,
  lucideHandHeart,
  lucideUsers,
  lucideBarChart3,
  lucideArrowRight,
  lucideMenu,
  lucideX,
  lucideChevronDown,
  lucideMail,
  lucidePhone,
  lucideMapPin,
  lucideSend,
  lucideCheckCircle2,
  lucideLoader2,
  lucideTrendingUp,
  lucideTarget,
  lucideGlobe,
} from '@ng-icons/lucide';

interface Project {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
  featuredImage: string | null;
  category?: { name: string } | null;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'nyots-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NgOptimizedImage,
    CurrencyPipe,
    HlmButton,
    HlmInput,
    HlmTextarea,
    HlmLabel,
    HlmBadge,
    HlmIcon,
  ],
  providers: [provideIcons({
    lucideSearch,
    lucideHeart,
    lucideHandHeart,
    lucideUsers,
    lucideBarChart3,
    lucideArrowRight,
    lucideMenu,
    lucideX,
    lucideChevronDown,
    lucideMail,
    lucidePhone,
    lucideMapPin,
    lucideSend,
    lucideCheckCircle2,
    lucideLoader2,
    lucideTrendingUp,
    lucideTarget,
    lucideGlobe,
  })],
  template: `
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e8e8] transition-all duration-300" [class.shadow-sm]="scrolled()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <svg class="h-8 w-auto text-[#6C0B0B] group-hover:text-[#8B0F0F] transition-colors" viewBox="0 0 7872.23 5801.51" fill="none">
              <path fill="#6C0B0B" d="M3176.38 1042.04l-471.89 0 -772.23 0c-223.58,0 -406.53,-182.93 -406.53,-406.53 0,-223.59 182.93,-406.54 406.53,-406.54l772.23 0 2423.3 0c223.6,0 406.53,182.95 406.53,406.54 0,223.6 -182.97,406.53 -406.53,406.53l-1061.38 0c0,838.3 -3.89,1675.91 -3.89,2513.83 0,239.05 -195.57,434.62 -434.61,434.62l-0.01 0c-2.17,0 -4.34,-0.05 -6.5,-0.08 -2.16,0.03 -4.34,0.08 -6.51,0.08l-0.01 0c-239.04,0 -434.61,-195.57 -434.61,-434.62 0,-837.92 -3.89,-1675.53 -3.89,-2513.83z"/>
              <path fill="#6C0B0B" d="M1292.29 905.23c52.42,26.65 98.77,63.64 136.39,108.22 8.66,9.69 15.24,21.29 24.8,30.05l2491.59 2287.22c176.02,161.57 107.02,498.22 -106.69,605.07l-0.02 0.01c-213.68,106.84 -433.96,60.05 -605.06,-106.69l-1702.19 -1658.64 0 1385.58c0,238.94 -195.51,434.45 -434.45,434.45l-0.01 0c-238.96,0 -434.45,-195.49 -434.45,-434.45l0 -2263.22c0,-320.61 338.82,-547.75 630.09,-387.6z"/>
              <path fill="#6C0B0B" d="M5661.66 852.56c671.66,0 1244.65,422.1 1468.43,1015.47 16.8,359.41 -536.26,425.84 -777.31,0 -162.28,-202.37 -411.54,-331.97 -691.11,-331.97 -489.03,0 -885.47,396.44 -885.47,885.47 0,489.03 396.44,885.47 885.47,885.47 316.97,0 594.99,-166.59 751.42,-416.95 179.15,-466.74 691.76,-425.84 746.37,0 -199.26,637.65 -794.47,1100.45 -1497.79,1100.45 -866.52,0 -1568.97,-702.45 -1568.97,-1568.97 0,-866.52 702.45,-1568.97 1568.97,-1568.97z"/>
            </svg>
            <span class="font-semibold text-lg tracking-tight" style="font-family: var(--font-family-display, 'Playfair Display', serif)">NyotsCo</span>
          </a>

          <!-- Desktop Nav -->
          <div class="hidden lg:flex items-center gap-8">
            <button (click)="scrollTo('projects')" class="text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] transition-colors">Projects</button>
            <button (click)="scrollTo('how-it-works')" class="text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] transition-colors">How It Works</button>
            <button (click)="scrollTo('about')" class="text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] transition-colors">About</button>
            <button (click)="scrollTo('contact')" class="text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] transition-colors">Contact</button>
          </div>

          <!-- CTA Buttons -->
          <div class="hidden lg:flex items-center gap-3">
            <a routerLink="/login" hlmBtn variant="ghost" size="sm">Log In</a>
            <a routerLink="/register" hlmBtn size="sm" class="bg-[#6C0B0B] hover:bg-[#8B0F0F] text-white">Get Started</a>
          </div>

          <!-- Mobile Menu Button -->
          <button class="lg:hidden p-2" (click)="mobileMenuOpen.set(!mobileMenuOpen())" aria-label="Toggle menu">
            @if (mobileMenuOpen()) {
              <ng-icon hlmIcon name="lucideX" size="sm" />
            } @else {
              <ng-icon hlmIcon name="lucideMenu" size="sm" />
            }
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="lg:hidden border-t border-[#e8e8e8] bg-white">
          <div class="px-4 py-4 space-y-3">
            <button (click)="scrollTo('projects'); mobileMenuOpen.set(false)" class="block w-full text-left text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] py-2">Projects</button>
            <button (click)="scrollTo('how-it-works'); mobileMenuOpen.set(false)" class="block w-full text-left text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] py-2">How It Works</button>
            <button (click)="scrollTo('about'); mobileMenuOpen.set(false)" class="block w-full text-left text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] py-2">About</button>
            <button (click)="scrollTo('contact'); mobileMenuOpen.set(false)" class="block w-full text-left text-sm font-medium text-[#7c8084] hover:text-[#6C0B0B] py-2">Contact</button>
            <div class="pt-3 border-t border-[#e8e8e8] flex flex-col gap-2">
              <a routerLink="/login" hlmBtn variant="outline" class="w-full justify-center">Log In</a>
              <a routerLink="/register" hlmBtn class="w-full justify-center bg-[#6C0B0B] hover:bg-[#8B0F0F] text-white">Get Started</a>
            </div>
          </div>
        </div>
      }
    </nav>

    <!-- Hero Section -->
    <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" #heroRef>
      <!-- Background Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#faf7f5] via-white to-[#f5efe9]"></div>
      <div class="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-[#6C0B0B]/3 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#d4a574]/10 blur-3xl"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C0B0B]/5 text-[#6C0B0B] text-sm font-medium mb-8 border border-[#6C0B0B]/10 reveal-item">
            <ng-icon hlmIcon name="lucideTrendingUp" size="sm" />
            <span>Community-Powered Investment</span>
          </div>

          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#222426] mb-6 leading-[1.1] reveal-item" style="font-family: var(--font-family-display, 'Playfair Display', serif)">
            Invest in What<br class="hidden sm:block" />
            <span class="text-[#6C0B0B]">Matters</span>
          </h1>

          <p class="text-lg sm:text-xl text-[#7c8084] mb-10 max-w-2xl mx-auto leading-relaxed reveal-item">
            NyotsCo connects passionate investors with impactful community projects. 
            From local infrastructure to sustainable ventures, your capital builds real change.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 reveal-item">
            <button (click)="scrollTo('projects')" hlmBtn size="lg" class="bg-[#6C0B0B] hover:bg-[#8B0F0F] text-white px-8">
              Explore Projects
              <ng-icon hlmIcon name="lucideArrowRight" size="sm" class="ml-2" />
            </button>
            <a routerLink="/register" hlmBtn variant="outline" size="lg" class="px-8">
              Start Investing
            </a>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto reveal-item">
          <div class="text-center">
            <div class="text-3xl font-bold text-[#6C0B0B]" style="font-family: var(--font-family-display, 'Playfair Display', serif)">
              {{ formatNumber(displayedStats().projects) }}+
            </div>
            <div class="text-sm text-[#7c8084] mt-1">Active Projects</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-[#6C0B0B]" style="font-family: var(--font-family-display, 'Playfair Display', serif)">
              {{ formatNumber(displayedStats().contributors) }}+
            </div>
            <div class="text-sm text-[#7c8084] mt-1">Contributors</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-[#6C0B0B]" style="font-family: var(--font-family-display, 'Playfair Display', serif)">
              {{ formatNumber(displayedStats().funded) }}+
            </div>
            <div class="text-sm text-[#7c8084] mt-1">Projects Funded</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-[#6C0B0B]" style="font-family: var(--font-family-display, 'Playfair Display', serif)">
              {{ formatCurrency(displayedStats().totalRaised) }}+
            </div>
            <div class="text-sm text-[#7c8084] mt-1">Total Raised</div>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="mt-16 animate-bounce">
          <button (click)="scrollTo('projects')" class="text-[#7c8084] hover:text-[#6C0B0B] transition-colors">
            <ng-icon hlmIcon name="lucideChevronDown" size="lg" />
          </button>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-24 bg-white" #projectsRef>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 reveal-item">
          <span class="text-sm font-semibold text-[#6C0B0B] uppercase tracking-wider">Discover</span>
          <h2 class="text-4xl sm:text-5xl font-bold text-[#222426] mt-3 mb-4" style="font-family: var(--font-family-display, 'Playfair Display', serif)">Active Projects</h2>
          <p class="text-lg text-[#7c8084] max-w-2xl mx-auto">Browse our current investment opportunities and find projects that align with your values.</p>
        </div>

        @if (projectsLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="rounded-xl border border-[#e8e8e8] bg-[#f8f8f8] p-6 animate-pulse">
                <div class="h-48 bg-[#e8e8e8] rounded-lg mb-4"></div>
                <div class="h-6 bg-[#e8e8e8] rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-[#e8e8e8] rounded w-full mb-2"></div>
                <div class="h-4 bg-[#e8e8e8] rounded w-2/3"></div>
              </div>
            }
          </div>
        } @else if (projects().length === 0) {
          <div class="text-center py-16">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6C0B0B]/5 mb-4">
              <ng-icon hlmIcon name="lucideTarget" size="lg" class="text-[#6C0B0B]" />
            </div>
            <h3 class="text-xl font-semibold text-[#222426] mb-2">No Active Projects</h3>
            <p class="text-[#7c8084]">Check back soon for new investment opportunities.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (project of projects(); track project.id) {
              <div class="group rounded-xl border border-[#e8e8e8] bg-white overflow-hidden hover:shadow-xl hover:shadow-[#6C0B0B]/5 transition-all duration-500 reveal-item">
                <!-- Project Image -->
                <div class="relative h-52 overflow-hidden">
                  @if (project.featuredImage) {
                    <img
                      [ngSrc]="project.featuredImage"
                      [alt]="project.title"
                      fill
                      class="object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  } @else {
                    <div class="absolute inset-0 bg-gradient-to-br from-[#6C0B0B]/10 to-[#d4a574]/20 flex items-center justify-center">
                      <ng-icon hlmIcon name="lucideGlobe" size="2xl" class="text-[#6C0B0B]/30" />
                    </div>
                  }
                  <div class="absolute top-3 left-3">
                    @if (project.category) {
                      <span hlmBadge variant="secondary" class="bg-white/90 backdrop-blur-sm">{{ project.category.name }}</span>
                    }
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6">
                  <h3 class="text-xl font-semibold text-[#222426] mb-2 line-clamp-1">{{ project.title }}</h3>
                  <p class="text-sm text-[#7c8084] mb-4 line-clamp-2 leading-relaxed">{{ project.description }}</p>

                  <!-- Progress -->
                  <div class="mb-4">
                    <div class="flex items-center justify-between text-sm mb-2">
                      <span class="text-[#7c8084]">{{ getProgress(project.currentAmount, project.goalAmount) | number:'1.0-0' }}% funded</span>
                      <span class="font-medium text-[#222426]">{{ project.currentAmount | currency }}</span>
                    </div>
                    <div class="w-full bg-[#f0f0f0] rounded-full h-2.5">
                      <div
                        class="bg-[#6C0B0B] h-2.5 rounded-full transition-all duration-1000"
                        [style.width.%]="getProgress(project.currentAmount, project.goalAmount)"
                      ></div>
                    </div>
                    <div class="flex justify-between text-xs text-[#7c8084] mt-1.5">
                      <span>Goal: {{ project.goalAmount | currency }}</span>
                    </div>
                  </div>

                  <a [routerLink]="['/dashboard/projects', project.id]" hlmBtn variant="outline" class="w-full justify-center text-[#6C0B0B] border-[#6C0B0B]/20 hover:bg-[#6C0B0B] hover:text-white">
                    View Project
                    <ng-icon hlmIcon name="lucideArrowRight" size="sm" class="ml-2" />
                  </a>
                </div>
              </div>
            }
          </div>

          @if (projects().length > 0) {
            <div class="text-center mt-12 reveal-item">
              <a routerLink="/dashboard/projects" hlmBtn variant="outline" size="lg" class="px-8">
                View All Projects
                <ng-icon hlmIcon name="lucideArrowRight" size="sm" class="ml-2" />
              </a>
            </div>
          }
        }
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="py-24 bg-[#faf7f5]" #howItWorksRef>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 reveal-item">
          <span class="text-sm font-semibold text-[#6C0B0B] uppercase tracking-wider">Process</span>
          <h2 class="text-4xl sm:text-5xl font-bold text-[#222426] mt-3 mb-4" style="font-family: var(--font-family-display, 'Playfair Display', serif)">How to Invest</h2>
          <p class="text-lg text-[#7c8084] max-w-2xl mx-auto">Four simple steps to start making an impact with your investments.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (step of investmentSteps; track step.number) {
            <div class="relative reveal-item">
              <!-- Connector Line -->
              @if (step.number < 4) {
                <div class="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-[#e8e8e8]"></div>
              }

              <div class="flex flex-col items-center text-center">
                <!-- Step Number Circle -->
                <div class="relative w-24 h-24 rounded-full bg-white border-2 border-[#6C0B0B]/10 flex items-center justify-center mb-6 shadow-sm group-hover:border-[#6C0B0B] transition-colors">
                  <span class="text-3xl font-bold text-[#6C0B0B]" style="font-family: var(--font-family-display, 'Playfair Display', serif)">{{ step.number }}</span>
                </div>

                <!-- Icon -->
                <div class="mb-4 text-[#6C0B0B]">
                  @if (step.number === 1) {
                    <ng-icon hlmIcon name="lucideSearch" size="lg" />
                  }
                  @if (step.number === 2) {
                    <ng-icon hlmIcon name="lucideHeart" size="lg" />
                  }
                  @if (step.number === 3) {
                    <ng-icon hlmIcon name="lucideHandHeart" size="lg" />
                  }
                  @if (step.number === 4) {
                    <ng-icon hlmIcon name="lucideBarChart3" size="lg" />
                  }
                </div>

                <h3 class="text-xl font-semibold text-[#222426] mb-3">{{ step.title }}</h3>
                <p class="text-sm text-[#7c8084] leading-relaxed">{{ step.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- About Us Section -->
    <section id="about" class="py-24 bg-white" #aboutRef>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <!-- Text Content -->
          <div class="reveal-item">
            <span class="text-sm font-semibold text-[#6C0B0B] uppercase tracking-wider">About Us</span>
            <h2 class="text-4xl sm:text-5xl font-bold text-[#222426] mt-3 mb-6" style="font-family: var(--font-family-display, 'Playfair Display', serif)">Building Communities,<br>One Project at a Time</h2>

            <div class="space-y-4 text-[#7c8084] leading-relaxed">
              <p>
                NyotsCo was founded on a simple belief: meaningful change happens when communities come together 
                to invest in their shared future. We are a platform that bridges the gap between visionary local 
                projects and investors who want to see their capital create tangible, lasting impact.
              </p>
              <p>
                From revitalizing neighborhood infrastructure to funding sustainable agriculture and education 
                initiatives, every project on NyotsCo is vetted for its potential to deliver real social, 
                environmental, and financial returns.
              </p>
              <p>
                Our mission is to democratize community investment — making it easy for anyone, anywhere, 
                to contribute to projects that matter. Whether you're investing $50 or $50,000, your 
                participation helps build stronger, more resilient communities.
              </p>
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              <span hlmBadge variant="outline" class="border-[#6C0B0B]/20 text-[#6C0B0B]">Community First</span>
              <span hlmBadge variant="outline" class="border-[#6C0B0B]/20 text-[#6C0B0B]">Transparent</span>
              <span hlmBadge variant="outline" class="border-[#6C0B0B]/20 text-[#6C0B0B]">Impact Driven</span>
              <span hlmBadge variant="outline" class="border-[#6C0B0B]/20 text-[#6C0B0B]">Secure</span>
            </div>
          </div>

          <!-- Visual / Stats -->
          <div class="reveal-item">
            <div class="relative">
              <div class="absolute -top-4 -left-4 w-72 h-72 bg-[#6C0B0B]/5 rounded-full blur-3xl"></div>
              <div class="relative bg-gradient-to-br from-[#faf7f5] to-white rounded-2xl p-8 border border-[#e8e8e8]">
                <h3 class="text-xl font-semibold text-[#222426] mb-6" style="font-family: var(--font-family-display, 'Playfair Display', serif)">Our Impact</h3>
                <div class="space-y-6">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full bg-[#6C0B0B]/5 flex items-center justify-center">
                      <ng-icon hlmIcon name="lucideTarget" size="sm" class="text-[#6C0B0B]" />
                    </div>
                    <div>
                      <div class="text-2xl font-bold text-[#222426]">{{ formatNumber(displayedStats().projects) }}+</div>
                      <div class="text-sm text-[#7c8084]">Projects Launched</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full bg-[#6C0B0B]/5 flex items-center justify-center">
                      <ng-icon hlmIcon name="lucideUsers" size="sm" class="text-[#6C0B0B]" />
                    </div>
                    <div>
                      <div class="text-2xl font-bold text-[#222426]">{{ formatNumber(displayedStats().contributors) }}+</div>
                      <div class="text-sm text-[#7c8084]">Active Contributors</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full bg-[#6C0B0B]/5 flex items-center justify-center">
                      <ng-icon hlmIcon name="lucideTrendingUp" size="sm" class="text-[#6C0B0B]" />
                    </div>
                    <div>
                      <div class="text-2xl font-bold text-[#222426]">{{ formatCurrency(displayedStats().totalRaised) }}+</div>
                      <div class="text-sm text-[#7c8084]">Capital Deployed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-24 bg-[#faf7f5]" #contactRef>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 reveal-item">
          <span class="text-sm font-semibold text-[#6C0B0B] uppercase tracking-wider">Get in Touch</span>
          <h2 class="text-4xl sm:text-5xl font-bold text-[#222426] mt-3 mb-4" style="font-family: var(--font-family-display, 'Playfair Display', serif)">Contact Us</h2>
          <p class="text-lg text-[#7c8084] max-w-2xl mx-auto">Have questions or want to learn more? We'd love to hear from you.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <!-- Contact Info -->
          <div class="lg:col-span-2 space-y-8 reveal-item">
            <div>
              <h3 class="text-xl font-semibold text-[#222426] mb-6" style="font-family: var(--font-family-display, 'Playfair Display', serif)">Contact Information</h3>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-[#6C0B0B]/5 flex items-center justify-center flex-shrink-0">
                    <ng-icon hlmIcon name="lucideMail" size="sm" class="text-[#6C0B0B]" />
                  </div>
                  <div>
                    <div class="text-sm text-[#7c8084]">Email</div>
                    <a href="mailto:info@nyotsco.com" class="text-[#222426] font-medium hover:text-[#6C0B0B] transition-colors">info@nyotsco.com</a>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-[#6C0B0B]/5 flex items-center justify-center flex-shrink-0">
                    <ng-icon hlmIcon name="lucidePhone" size="sm" class="text-[#6C0B0B]" />
                  </div>
                  <div>
                    <div class="text-sm text-[#7c8084]">Phone</div>
                    <span class="text-[#222426] font-medium">+1 (555) 123-4567</span>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-[#6C0B0B]/5 flex items-center justify-center flex-shrink-0">
                    <ng-icon hlmIcon name="lucideMapPin" size="sm" class="text-[#6C0B0B]" />
                  </div>
                  <div>
                    <div class="text-sm text-[#7c8084]">Address</div>
                    <span class="text-[#222426] font-medium">123 Investment Avenue<br>Nairobi, Kenya</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="lg:col-span-3 reveal-item">
            <div class="bg-white rounded-2xl p-8 border border-[#e8e8e8] shadow-sm">
              @if (contactSuccess()) {
                <div class="text-center py-8">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                    <ng-icon hlmIcon name="lucideCheckCircle2" size="xl" class="text-green-600" />
                  </div>
                  <h3 class="text-xl font-semibold text-[#222426] mb-2">Message Sent!</h3>
                  <p class="text-[#7c8084] mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
                  <button (click)="resetContactForm()" hlmBtn variant="outline">Send Another Message</button>
                </div>
              } @else {
                <form (submit)="submitContactForm($event)" class="space-y-5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="space-y-2">
                      <label hlmLabel for="contactName">Full Name</label>
                      <input
                        hlmInput
                        id="contactName"
                        type="text"
                        [(ngModel)]="contactForm().name"
                        name="contactName"
                        placeholder="John Doe"
                        required
                        class="w-full"
                      />
                    </div>
                    <div class="space-y-2">
                      <label hlmLabel for="contactEmail">Email</label>
                      <input
                        hlmInput
                        id="contactEmail"
                        type="email"
                        [(ngModel)]="contactForm().email"
                        name="contactEmail"
                        placeholder="john@example.com"
                        required
                        class="w-full"
                      />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label hlmLabel for="contactSubject">Subject</label>
                    <input
                      hlmInput
                      id="contactSubject"
                      type="text"
                      [(ngModel)]="contactForm().subject"
                      name="contactSubject"
                      placeholder="How can we help?"
                      required
                      class="w-full"
                    />
                  </div>
                  <div class="space-y-2">
                    <label hlmLabel for="contactMessage">Message</label>
                    <textarea
                      hlmTextarea
                      id="contactMessage"
                      [(ngModel)]="contactForm().message"
                      name="contactMessage"
                      placeholder="Tell us more about your inquiry..."
                      rows="5"
                      required
                      class="w-full resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    hlmBtn
                    class="w-full bg-[#6C0B0B] hover:bg-[#8B0F0F] text-white"
                    [disabled]="contactSubmitting()"
                  >
                    @if (contactSubmitting()) {
                      <ng-icon hlmIcon name="lucideLoader2" size="sm" class="mr-2 animate-spin" />
                      Sending...
                    } @else {
                      <ng-icon hlmIcon name="lucideSend" size="sm" class="mr-2" />
                      Send Message
                    }
                  </button>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-[#222426] text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <!-- Brand -->
          <div class="md:col-span-1">
            <div class="flex items-center gap-3 mb-4">
              <svg class="h-8 w-auto text-white" viewBox="0 0 7872.23 5801.51" fill="none">
                <path fill="white" d="M3176.38 1042.04l-471.89 0 -772.23 0c-223.58,0 -406.53,-182.93 -406.53,-406.53 0,-223.59 182.93,-406.54 406.53,-406.54l772.23 0 2423.3 0c223.6,0 406.53,182.95 406.53,406.54 0,223.6 -182.97,406.53 -406.53,406.53l-1061.38 0c0,838.3 -3.89,1675.91 -3.89,2513.83 0,239.05 -195.57,434.62 -434.61,434.62l-0.01 0c-2.17,0 -4.34,-0.05 -6.5,-0.08 -2.16,0.03 -4.34,0.08 -6.51,0.08l-0.01 0c-239.04,0 -434.61,-195.57 -434.61,-434.62 0,-837.92 -3.89,-1675.53 -3.89,-2513.83z"/>
                <path fill="white" d="M1292.29 905.23c52.42,26.65 98.77,63.64 136.39,108.22 8.66,9.69 15.24,21.29 24.8,30.05l2491.59 2287.22c176.02,161.57 107.02,498.22 -106.69,605.07l-0.02 0.01c-213.68,106.84 -433.96,60.05 -605.06,-106.69l-1702.19 -1658.64 0 1385.58c0,238.94 -195.51,434.45 -434.45,434.45l-0.01 0c-238.96,0 -434.45,-195.49 -434.45,-434.45l0 -2263.22c0,-320.61 338.82,-547.75 630.09,-387.6z"/>
                <path fill="white" d="M5661.66 852.56c671.66,0 1244.65,422.1 1468.43,1015.47 16.8,359.41 -536.26,425.84 -777.31,0 -162.28,-202.37 -411.54,-331.97 -691.11,-331.97 -489.03,0 -885.47,396.44 -885.47,885.47 0,489.03 396.44,885.47 885.47,885.47 316.97,0 594.99,-166.59 751.42,-416.95 179.15,-466.74 691.76,-425.84 746.37,0 -199.26,637.65 -794.47,1100.45 -1497.79,1100.45 -866.52,0 -1568.97,-702.45 -1568.97,-1568.97 0,-866.52 702.45,-1568.97 1568.97,-1568.97z"/>
              </svg>
              <span class="font-semibold text-lg" style="font-family: var(--font-family-display, 'Playfair Display', serif)">NyotsCo</span>
            </div>
            <p class="text-[#9ca3af] text-sm leading-relaxed">
              Empowering communities through accessible, transparent investment opportunities.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-semibold text-sm uppercase tracking-wider mb-4">Platform</h4>
            <ul class="space-y-3">
              <li><button (click)="scrollTo('projects')" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Projects</button></li>
              <li><button (click)="scrollTo('how-it-works')" class="text-[#9ca3af] hover:text-white transition-colors text-sm">How It Works</button></li>
              <li><button (click)="scrollTo('about')" class="text-[#9ca3af] hover:text-white transition-colors text-sm">About</button></li>
              <li><button (click)="scrollTo('contact')" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Contact</button></li>
            </ul>
          </div>

          <!-- Account -->
          <div>
            <h4 class="font-semibold text-sm uppercase tracking-wider mb-4">Account</h4>
            <ul class="space-y-3">
              <li><a routerLink="/login" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Log In</a></li>
              <li><a routerLink="/register" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Register</a></li>
              <li><a routerLink="/dashboard" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Dashboard</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h4 class="font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" class="text-[#9ca3af] hover:text-white transition-colors text-sm">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-[#374151] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-[#9ca3af] text-sm">&copy; {{ currentYear }} NyotsCo. All rights reserved.</p>
          <p class="text-[#9ca3af] text-xs">Empowering communities through collective investment.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      scroll-behavior: smooth;
    }

    html {
      scroll-behavior: smooth;
    }

    /* Reveal animations */
    .reveal-item {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }

    .reveal-item.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* Stagger delay classes */
    .reveal-item:nth-child(1) { transition-delay: 0ms; }
    .reveal-item:nth-child(2) { transition-delay: 100ms; }
    .reveal-item:nth-child(3) { transition-delay: 200ms; }
    .reveal-item:nth-child(4) { transition-delay: 300ms; }
    .reveal-item:nth-child(5) { transition-delay: 400ms; }
    .reveal-item:nth-child(6) { transition-delay: 500ms; }

    /* Hero specific */
    #hero .reveal-item {
      transition-delay: 0ms;
    }

    #hero .reveal-item:nth-child(1) { transition-delay: 0ms; }
    #hero .reveal-item:nth-child(2) { transition-delay: 150ms; }
    #hero .reveal-item:nth-child(3) { transition-delay: 300ms; }
    #hero .reveal-item:nth-child(4) { transition-delay: 450ms; }

    /* Line clamp utilities */
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Bounce animation for scroll indicator */
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(8px); }
    }
    .animate-bounce {
      animation: bounce 2s ease-in-out infinite;
    }

    /* Pulse for loading */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    /* Spin for loader */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class HomePage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private projectService = inject(ProjectService);
  private contactService = inject(ContactService);

  // Scroll state
  scrolled = signal(false);
  mobileMenuOpen = signal(false);

  // Stats
  rawStats = signal({ projects: 0, contributors: 0, funded: 0, totalRaised: 0 });
  displayedStats = signal({ projects: 0, contributors: 0, funded: 0, totalRaised: 0 });

  // Projects
  projects = signal<Project[]>([]);
  projectsLoading = signal(true);

  // Contact form
  contactForm = signal<ContactForm>({ name: '', email: '', subject: '', message: '' });
  contactSubmitting = signal(false);
  contactSuccess = signal(false);

  // Current year
  currentYear = new Date().getFullYear();

  // Investment steps
  investmentSteps = [
    {
      number: 1,
      title: 'Browse',
      description: 'Discover projects that align with your values and investment goals across various categories.',
      icon: 'lucideSearch' as const,
    },
    {
      number: 2,
      title: 'Choose',
      description: 'Select the causes and ventures you care about most. Review details, goals, and impact metrics.',
      icon: 'lucideHeart' as const,
    },
    {
      number: 3,
      title: 'Contribute',
      description: 'Invest securely in minutes with our streamlined contribution process and multiple payment options.',
      icon: 'lucideHandHeart' as const,
    },
    {
      number: 4,
      title: 'Track',
      description: 'Watch your impact grow. Receive updates on project progress and see your capital create change.',
      icon: 'lucideBarChart3' as const,
    },
  ];

  // Section refs for intersection observer
  @ViewChild('heroRef') heroRef!: ElementRef;
  @ViewChild('projectsRef') projectsRef!: ElementRef;
  @ViewChild('howItWorksRef') howItWorksRef!: ElementRef;
  @ViewChild('aboutRef') aboutRef!: ElementRef;
  @ViewChild('contactRef') contactRef!: ElementRef;

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Load projects and stats
      await this.loadProjects();
      await this.loadStats();

      // Setup scroll listener
      this.setupScrollListener();

      // Setup intersection observer for animations
      setTimeout(() => this.setupIntersectionObserver(), 100);
    }
  }

  private async loadProjects() {
    this.projectsLoading.set(true);
    try {
      const result = await this.projectService.getActiveProjects({ first: 6 });
      const fetched = result?.edges?.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        goalAmount: edge.node.goalAmount,
        currentAmount: edge.node.currentAmount,
        status: edge.node.status,
        featuredImage: edge.node.featuredImage || null,
        category: edge.node.category,
      })) || [];
      this.projects.set(fetched);
    } catch (error) {
      console.error('Error loading projects:', error);
      this.projects.set([]);
    } finally {
      this.projectsLoading.set(false);
    }
  }

  private async loadStats() {
    try {
      // Fetch from backend APIs
      const projectsResult = await this.projectService.getActiveProjects({});
      const projectsCount = projectsResult?.totalCount || 0;

      // For user count and total raised, we'll use reasonable fallbacks
      // In a real app you'd have a dedicated stats endpoint
      this.rawStats.set({
        projects: Math.max(projectsCount, 10),
        contributors: 624, // fallback until we have endpoint
        funded: Math.max(projectsCount, 10),
        totalRaised: 2450000, // fallback
      });

      // Animate stats to target
      this.animateStats();
    } catch (error) {
      console.error('Error loading stats:', error);
      // Use minimums as specified
      this.rawStats.set({
        projects: 12,
        contributors: 624,
        funded: 8,
        totalRaised: 2450000,
      });
      this.animateStats();
    }
  }

  private animateStats() {
    const target = this.rawStats();
    const duration = 2000;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      this.displayedStats.set({
        projects: Math.round(target.projects * eased),
        contributors: Math.round(target.contributors * eased),
        funded: Math.round(target.funded * eased),
        totalRaised: Math.round(target.totalRaised * eased),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.scrolled.set(window.scrollY > 10);
    }, { passive: true });
  }

  private setupIntersectionObserver() {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('.reveal-item');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('revealed');
              }, index * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all sections
    [
      this.heroRef?.nativeElement,
      this.projectsRef?.nativeElement,
      this.howItWorksRef?.nativeElement,
      this.aboutRef?.nativeElement,
      this.contactRef?.nativeElement,
    ].forEach(el => {
      if (el) observer.observe(el);
    });
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getProgress(current: number, goal: number): number {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  formatCurrency(num: number): string {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return '$' + (num / 1000).toFixed(0) + 'K';
    }
    return '$' + num.toString();
  }

  async submitContactForm(event: Event) {
    event.preventDefault();
    this.contactSubmitting.set(true);

    try {
      const form = this.contactForm();
      await this.contactService.sendContactMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      this.contactSuccess.set(true);
    } catch (error) {
      console.error('Error sending contact message:', error);
    } finally {
      this.contactSubmitting.set(false);
    }
  }

  resetContactForm() {
    this.contactForm.set({ name: '', email: '', subject: '', message: '' });
    this.contactSuccess.set(false);
  }
}
