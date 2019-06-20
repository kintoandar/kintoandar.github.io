---
title: "Conky Config eee Netbook"
excerpt: "Tutorial on how to display maximum information on an eee Netbook with a conky configuration."
header:
  teaser: /images/conky_eee.png
  og_image: /images/conky_eee.png
gallery:
  - url: /images/conky_eee.png
    image_path: /images/conky_eee.png 
    alt: "conky"
tags:
  - automation
  - linux
---

Just remembered how fun it was to tinker with [conky](https://en.wikipedia.org/wiki/Conky_%28software%29) scripts, so here is the config I've made for my eee Netbook.

I've tried to arrange it so it would display maximum information on such a small screen, as I mostly use wireless lan I didn't bother with cable interfaces, but you may change it to your likings.

{% include gallery caption="Desktop screeshot" %}

To run it on your system you need the conky package:

{% highlight bash %}
apt-get install conky || yum install conky
{% endhighlight %}

And drop the following config on `~/.conkyrc`:

{% highlight bash %}
########################
# kintoandar            
########################


# Create own window instead of using desktop
own_window yes
own_window_transparent yes
own_window_type override
own_window_hints undecorated,below,skip_taskbar
#background yes

# Use double buffering
double_buffer yes

# fiddle with window
use_spacer right
use_xft yes

# Update interval in seconds
update_interval 5.0

# Minimum size of text area
minimum_size 160 5
maximum_width 160

# Draw shades?
draw_shades no

# Text stuff
draw_outline no # amplifies text if yes
draw_borders no

uppercase no # set to yes if you want all text to be in uppercase

# Stippled borders
#stippled_borders 8

# border margins
#border_margin 4

# border width
#border_width 1

# Default colors and also border colors
default_color white
default_shade_color black
default_outline_color white

own_window_colour brown
own_window_transparent yes

# Text alignment
alignment top_right

# Gap between borders of screen and text
gap_x 20
gap_y 10

# stuff after 'TEXT' will be formatted on screen
override_utf8_locale yes
xftfont Sans:size=8
xftalpha 0.8

TEXT

${offset 0}${color slate grey}Uptime: ${color lightgrey}$uptime
${offset 0}${color slate grey}Load: ${color orange}$loadavg
${offset 0}${color slate grey}Procs: ${color lightgrey}$processes
${offset 0}${color slate grey}CPU:${color lightgrey} $cpu% ${color slate grey}Temp: ${color lightgrey}${acpitemp}ºC
${color orange} ${offset 0}${cpugraph 15,130 666666 bbbbbb}
#
${offset 0}${color slate grey}CPU top:
${offset 0}${color orange} ${top name 1}${top_mem cpu 1}%
${offset 0}${color lightgrey} ${top name 2}${top cpu 2}%
${offset 0}${color lightgrey} ${top name 3}${top cpu 3}%

${offset 0}${color slate grey}Mem top:
${offset 0}${color orange} ${top_mem name 1}${top_mem mem 1}%
${offset 0}${color lightgrey} ${top_mem name 2}${top_mem mem 2}%
${offset 0}${color lightgrey} ${top_mem name 3}${top_mem mem 3}%

${offset 0}${color slate grey}Mem:  ${color orange} $memperc% ${color lightgrey}$mem/$memmax
${color orange} ${offset 0}${membar 3,100}
${offset 0}${color slate grey}Swap: ${color orange} $swapperc% ${color lightgrey}$swap/$swapmax
${color orange} ${offset 0}${swapbar 3,100}

${offset 0}${color slate grey}/home:  ${color lightgrey}${fs_free /home} free
${offset 0} ${color orange} ${fs_bar 3,100 /home}
${offset 0}${color slate grey}/opt:  ${color lightgrey}${fs_free /opt} free
${offset 0} ${color orange} ${fs_bar 3,100 /opt}

${offset 0}${color slate grey}IP: ${color lightgrey}${exec ip route list|grep src|awk {'print $9'}}
${offset 0}${color slate grey}Signal: ${color orange}${wireless_link_bar 3,66 wlan0}
${offset 0}$alignc${color slate grey}Up:${color lightgrey}${upspeed wlan0}${offset 0}${color slate grey} Down:${color lightgrey}${downspeed wlan0}
${color orange} ${offset 0}${upspeedgraph wlan0 15,65 666666 bbbbbb}${color orange} ${offset 0}${downspeedgraph wlan0 15,65 666666 bbbbbb}
# dmsg logs, 2 lines
${color slate grey}dmsg:
${color lightgrey}${exec dmesg |tail -n 2}

# Lists the files I'm downloading
${color slate grey}Incoming:
${color lightgrey}${exec ls /media/server2/downloads/rtorrent/ /media/server2/downloads/poweruser/|grep -v server2|grep -v ^$}
{% endhighlight %}
