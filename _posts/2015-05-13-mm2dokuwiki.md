---
layout: post
---

====== FreeMind mindmaps to Dokuwiki ======

FreeMind mindmaps are trees and are stored simply as XML document. Furthermore, FreeMind's GUI allows export any map with XSLT transformation applied (or you can do it manually on particular file).

<file xml mm2dokuwiki.xsl>
<?xml version="1.0" encoding="utf-8"?>
<stylesheet xmlns="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<output method="text" indent="no"/>
	<strip-space elements="*"/>
	<param name="offset" select="0"/>

	<template match="/">
		<apply-templates match="/map/node" />
	</template>
	

	<template match="node">
		<call-template name="indent">
			<with-param name="width" select="count(ancestor::*) - 1 - number($offset)"/>
		</call-template>
		<text>* </text>
		<value-of select="@TEXT"/>
		<text>
</text>
		<apply-templates match="node" />
	</template>

	<template name="indent">
		<param name="width"/>
		<text>  </text>
		<if test="$width &gt; 0">
			<call-template name="indent">
				<with-param name="width" select="number($width) - 1"/>
			</call-template>
		</if>
	</template>
</stylesheet>
</file>

Usage
    xsltproc --param offset 1 mm2dokuwiki.xsl <some-map>.mm
''offset'' is an optional parameter that allows reducing offset of nested lists.