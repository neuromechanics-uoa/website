#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'Angus McMorland'
SITENAME = 'Neuromechanics @ UOA'
SITEURL = ''

PATH = 'content'

TIMEZONE = 'Pacific/Auckland'

DEFAULT_LANG = 'English'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

THEME = "../pelican-themes/medius"

# Blogroll
LINKS = (('University of Auckland', 'https://www.auckland.ac.nz/'),
         ('Exercise Sciences', 'https://www.auckland.ac.nz/en/science/about-the-faculty/department-of-exercise-sciences.html'),
         ('Auckland Bioengineering Institute', 'https://www.auckland.ac.nz/en/abi.html'))

# Social widget
SOCIAL = (('twitter', 'https://twitter.com/amcmorl'),
          ('instagram', 'https://instagram.com/amcmorl'),
          ('github', 'https://github.com/amcmorl'),
          ('scholar.social', 'https://scholar.social/@amcmorl'))

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
