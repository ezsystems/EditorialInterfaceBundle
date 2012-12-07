<?php
/**
 * File containing the PreContentViewListenerTest class.
 *
 * @copyright Copyright (C) 1999-2012 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\EditorialInterfaceBundle\Tests\Twig\Extension;

use PHPUnit_Framework_TestCase;

use EzSystems\EditorialInterfaceBundle\EventListener\PreContentViewListener;

use eZ\Publish\Core\Repository\Values\Content\ContentInfo;
use eZ\Publish\Core\Repository\Values\Content\VersionInfo;
use eZ\Publish\Core\Repository\Values\Content\Content;
use eZ\Publish\Core\Repository\Values\Content\Location;
use eZ\Publish\Core\Repository\Values\ContentType\ContentType;

class PreContentViewListenerTest extends PHPUnit_Framework_TestCase
{

    /**
     * @dataProvider providerTestMetadataViewParameters
     */
    public function testMetadataViewParameters(
        Content $content, Location $location, $canEdit, $prefix, $expectedAddParameters
    )
    {
        $listener = new PreContentViewListener(
            $this->getRepositoryMock( $content, $canEdit ),
            $prefix
        );
        $listener->onPreContentView(
            $this->getPreContentViewEventMock(
                $content, $location, $canEdit, $expectedAddParameters
            )
        );
    }

    public function providerTestMetadataViewParameters()
    {
        $tests = array();
        $typeIdentifier = 'folder';
        $locationId = 60;
        $contentId = 59;
        $locale = 'fre-FR';
        $content = $this->getContent( $typeIdentifier, $contentId, $locale, 3 );
        $prefix = 'data-ez-';
        $tests[] = array(
            $content,
            $this->getLocation( $content, $locationId ),
            false,
            $prefix,
            array() // not used if canEdit is false
        );

        $tests[] = array(
            $content,
            $this->getLocation( $content, $locationId ),
            true,
            $prefix,
            array(
                'editorial_interface_meta' => array(
                    $prefix . 'editable-region' => 'true',
                    $prefix . 'type-identifier' => $typeIdentifier,
                    $prefix . 'location-id' => $locationId,
                    $prefix . 'content-id' => $contentId,
                    $prefix . 'locale-code' => $locale,
                )
            )
        );
        $prefix .= $prefix;
        $tests[] = array(
            $content,
            $this->getLocation( $content, $locationId ),
            false,
            $prefix,
            array() // not used if canEdit is false
        );

        $tests[] = array(
            $content,
            $this->getLocation( $content, $locationId ),
            true,
            $prefix,
            array(
                'editorial_interface_meta' => array(
                    $prefix . 'editable-region' => 'true',
                    $prefix . 'type-identifier' => $typeIdentifier,
                    $prefix . 'location-id' => $locationId,
                    $prefix . 'content-id' => $contentId,
                    $prefix . 'locale-code' => $locale,
                )
            )
        );


        return $tests;
    }

    private function getLocation( Content $content, $id )
    {
        $location = new Location(
            array(
                'contentInfo' => $content->contentInfo,
                'path' => array(),
                'id' => $id,
            )
        );
        return $location;
    }

    private function getContent( $typeIdentifier, $id, $locale, $versionNo )
    {
        $content = new Content(
            array(
                'internalFields' => array(),
                'versionInfo' => new VersionInfo(
                    array(
                        'versionNo' => $versionNo,
                        'initialLanguageCode' => $locale,
                        'contentInfo' => new ContentInfo(
                            array(
                                'id' => $id,
                                'mainLanguageCode' => $locale,
                                'contentType' => new ContentType(
                                    array(
                                        'fieldDefinitions' => array(),
                                        'identifier' => $typeIdentifier
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );

        return $content;

    }

    private function getViewMock( Content $content, Location $location, $canEdit, array $expectedAddParameters )
    {
        $mock = $this->getMock(
            'eZ\\Publish\\Core\\MVC\\Symfony\\View\\ContentView'
        );

        $mock->expects( $this->once() )
            ->method( 'getTemplateIdentifier' )
            ->will( $this->returnValue( 'a_string' ) );

        $mock->expects( $this->any() )
            ->method( 'getParameter' )
            ->will(
                $this->returnValueMap(
                    array(
                        array( 'content', $content ),
                        array( 'location', $location )
                    )
                )
            );
        if ( $canEdit )
        {
            $mock->expects( $this->once() )
                ->method( 'addParameters' )
                ->with( $this->equalTo( $expectedAddParameters ) );
        }
        return $mock;
    }

    private function getPreContentViewEventMock(
        Content $content, Location $location, $canEdit, array $expectedAddParameters
    )
    {
        $mock = $this->getMockBuilder( 'eZ\\Publish\\Core\\MVC\\Symfony\\Event\\PreContentViewEvent' )
            ->disableOriginalConstructor()
            ->getMock();

        $mock->expects( $this->once() )
            ->method( 'getContentView' )
            ->will(
                $this->returnValue(
                    $this->getViewMock(
                        $content, $location, $canEdit, $expectedAddParameters
                    )
                )
            );

        return $mock;
    }

    private function getRepositoryMock( Content $content, $canEdit )
    {
        $mock = $this->getMock(
            'eZ\\Publish\\API\\Repository\\Repository'
        );
        $mock->expects( $this->once() )
            ->method( 'canUser' )
            ->with(
                $this->equalTo( 'content' ),
                $this->equalTo( 'edit' ),
                $this->equalTo( $content )
            )
            ->will( $this->returnValue( $canEdit ) );
        return $mock;
    }


}
