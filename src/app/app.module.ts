import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule, routingComponent } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './Plantillas/footer/footer.component';
import { HeaderComponent } from './Plantillas/header/header.component';
import { SidebarComponent } from './Plantillas/sidebar/sidebar.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './Control/jwt-interceptor.interceptor';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GeneralComponent } from './Paginas/Reportes/general/general.component';
import { UltimaComponent } from './Paginas/Reportes/ultima/ultima.component';
import { ConfiguracionComponent } from './Paginas/Independientes/configuracion/configuracion.component';
import { RecargoComponent } from './Paginas/Independientes/recargo/recargo.component';
import { TipoRecargoComponent } from './Paginas/Independientes/tipo-recargo/tipo-recargo.component';
import { DescargarComponent } from './Paginas/Independientes/descargar/descargar.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { Alertas } from './Control/Alerts';
import { BarChartComponent } from './Graficos/bar-chart/bar-chart.component';
import { LineChartComponent } from './Graficos/line-chart/line-chart.component';



registerLocaleData(localeEs);
@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
    routingComponent,
    GeneralComponent,
    UltimaComponent,
    ConfiguracionComponent,
    RecargoComponent,
    TipoRecargoComponent,
    DescargarComponent,
    BarChartComponent,
    LineChartComponent,
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CarouselModule.forRoot(),
    NgApexchartsModule,
    NgbModule,
    NgxExtendedPdfViewerModule,
    NgbDatepickerModule,
    // Charts 
    
  ],
  exports: [    
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },

    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


